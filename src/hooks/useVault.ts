import { useState, useCallback, useEffect } from 'react';
import { deriveKey, encrypt, decrypt, generateSalt } from '../utils/crypto';
import type { Credential, EncryptedCredential, MasterKey } from '../types';

const STORAGE_KEY = 'secure_vault_data';
const MASTER_KEY = 'master_key';

export function useVault() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupMasterPassword = useCallback(async (password: string) => {
    if (password.length < 8) {
      setError('Master password must be at least 8 characters long');
      return false;
    }

    try {
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const verifier = await encrypt('verified', key);
      
      const masterKeyData: MasterKey = {
        salt,
        verifier: JSON.stringify(verifier)
      };
      
      localStorage.setItem(MASTER_KEY, JSON.stringify(masterKeyData));
      setMasterKey(key);
      setIsUnlocked(true);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to set up master password');
      return false;
    }
  }, []);

  const unlock = useCallback(async (password: string) => {
    const masterKeyData = localStorage.getItem(MASTER_KEY);
    if (!masterKeyData) return false;

    try {
      const { salt, verifier } = JSON.parse(masterKeyData) as MasterKey;
      const key = await deriveKey(password, salt);
      
      const { encryptedData, iv } = JSON.parse(verifier);
      await decrypt(encryptedData, iv, key);
      setMasterKey(key);
      setIsUnlocked(true);
      setError(null);
      return true;
    } catch {
      setError('Invalid master password');
      return false;
    }
  }, []);

  const addCredential = useCallback(async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!masterKey) {
      setError('Vault is locked');
      throw new Error('Vault is locked');
    }

    // Validate input
    if (!credential.title || !credential.username || !credential.password) {
      setError('Title, username, and password are required');
      throw new Error('Incomplete credential');
    }

    try {
      const newCredential: Credential = {
        ...credential,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const { encryptedData, iv } = await encrypt(JSON.stringify(newCredential), masterKey);
      
      const encryptedCredential: EncryptedCredential = {
        id: newCredential.id,
        encryptedData,
        iv,
        createdAt: newCredential.createdAt,
        updatedAt: newCredential.updatedAt
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const storedCredentials = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...storedCredentials, encryptedCredential]));

      setCredentials(prev => [...prev, newCredential]);
      setError(null);
      return newCredential;
    } catch (err) {
      setError('Failed to add credential');
      throw err;
    }
  }, [masterKey]);

  const loadCredentials = useCallback(async () => {
    if (!masterKey) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setCredentials([]);
        return;
      }

      const encryptedCredentials = JSON.parse(stored) as EncryptedCredential[];
      const decryptedCredentials = await Promise.all(
        encryptedCredentials.map(async ({ encryptedData, iv, ...rest }) => {
          const decrypted = await decrypt(encryptedData, iv, masterKey);
          return JSON.parse(decrypted) as Credential;
        })
      );

      setCredentials(decryptedCredentials);
      setError(null);
    } catch (err) {
      setError('Failed to load credentials');
      setCredentials([]);
    }
  }, [masterKey]);

  useEffect(() => {
    if (masterKey) {
      loadCredentials().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [masterKey, loadCredentials]);

  return {
    isUnlocked,
    isLoading,
    credentials,
    setupMasterPassword,
    unlock,
    addCredential,
    error
  };
}