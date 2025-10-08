import React, { useState } from 'react';
import { Shield, Key, Plus, Lock, Unlock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useVault } from './hooks/useVault';
import { generatePassword } from './utils/crypto';

function App() {
  const { 
    isUnlocked, 
    isLoading, 
    credentials, 
    setupMasterPassword, 
    unlock, 
    addCredential,
    error 
  } = useVault();
  const [masterPassword, setMasterPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCredential, setNewCredential] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const stored = localStorage.getItem('master_key');
    if (!stored) {
      await setupMasterPassword(masterPassword);
    } else {
      await unlock(masterPassword);
    }
    setMasterPassword('');
  };

  const handleAddCredential = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await addCredential(newCredential);
      setShowAddForm(false);
      setNewCredential({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: ''
      });
    } catch (err) {
      // Error is already handled in useVault hook
    }
  };

  const generateNewPassword = () => {
    setNewCredential(prev => ({
      ...prev,
      password: generatePassword()
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-blue-500" />
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-xl">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              SecureVault
            </h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <AlertTriangle className="inline-block mr-2 h-5 w-5" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="masterPassword" className="sr-only">Master Password</label>
              <input
                id="masterPassword"
                type="password"
                required
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Master Password"
              />
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Lock className="h-5 w-5 mr-2" /> Unlock Vault
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <Shield className="inline-block mr-3 h-8 w-8 text-blue-500" />
            SecureVault
          </h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Credential
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <AlertTriangle className="inline-block mr-2 h-5 w-5" />
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Credential</h2>
            <form onSubmit={handleAddCredential} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newCredential.title}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newCredential.username}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="border rounded-md px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Password"
                    value={newCredential.password}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="border rounded-md px-3 py-2 w-full"
                  />
                  <button 
                    type="button"
                    onClick={generateNewPassword}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={newCredential.url}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, url: e.target.value }))}
                  className="border rounded-md px-3 py-2"
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={newCredential.notes}
                onChange={(e) => setNewCredential(prev => ({ ...prev, notes: e.target.value }))}
                className="border rounded-md px-3 py-2 w-full"
                rows={3}
              />
              <div className="flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {credentials.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No credentials saved yet. Add your first credential!</p>
            </div>
          ) : (
            credentials.map(credential => (
              <div 
                key={credential.id} 
                className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{credential.title}</h3>
                  <p className="text-gray-600">{credential.username}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    title="View Details"
                  >
                    <Key className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Unlock className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;