import React, { useState } from 'react';
import { Shield, Key, Plus, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useVault } from './hooks/useVault';
import { generatePassword } from './utils/crypto';

function App() {
  const { isUnlocked, isLoading, credentials, setupMasterPassword, unlock, addCredential } = useVault();
  const [masterPassword, setMasterPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const stored = localStorage.getItem('master_key');
    try {
      if (!stored) {
        await setupMasterPassword(masterPassword);
      } else {
        const success = await unlock(masterPassword);
        if (!success) {
          setError('Invalid master password');
          return;
        }
      }
      setMasterPassword('');
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleAddCredential = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    await addCredential({
      title: formData.get('title') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      url: formData.get('url') as string,
      notes: formData.get('notes') as string,
    });

    setShowAddForm(false);
    form.reset();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">SecureVault</h2>
            <p className="mt-2 text-sm text-gray-600">
              {localStorage.getItem('master_key') ? 'Unlock your vault' : 'Set up your vault'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleUnlock}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="master-password" className="sr-only">Master Password</label>
                <input
                  id="master-password"
                  name="password"
                  type="password"
                  required
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Master Password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Key className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                {localStorage.getItem('master_key') ? 'Unlock' : 'Set Master Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">SecureVault</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Password
          </button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Password</h3>
              <form onSubmit={handleAddCredential} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="password"
                      id="password"
                      required
                      className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const password = generatePassword();
                        document.getElementById('password')!.value = password;
                      }}
                      className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL (optional)</label>
                  <input
                    type="url"
                    name="url"
                    id="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {credentials.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                No passwords saved yet. Click "Add Password" to get started.
              </li>
            ) : (
              credentials.map((credential) => (
                <li key={credential.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{credential.title}</h3>
                      <p className="text-sm text-gray-500">{credential.username}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(credential.password)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Copy Password
                      </button>
                      {credential.url && (
                        <a
                          href={credential.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Visit Site
                        </a>
                      )}
                    </div>
                  </div>
                  {credential.notes && (
                    <p className="mt-2 text-sm text-gray-600">{credential.notes}</p>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;