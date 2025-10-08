export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedCredential {
  id: string;
  encryptedData: string;
  iv: string;
  createdAt: number;
  updatedAt: number;
}

export interface MasterKey {
  salt: string;
  verifier: string;
}