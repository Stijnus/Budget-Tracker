import { useState } from 'react';
import { AppLayout } from '../shared/components/layout';
import {
  ProfileForm,
  PasswordChangeForm,
  AccountDeletionForm,
  UserSettingsForm,
} from '../features/auth/components';

// Define the tabs
type SettingsTab = 'profile' | 'password' | 'preferences' | 'account';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-3 text-left text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-4 py-3 text-left text-sm font-medium ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-4 py-3 text-left text-sm font-medium ${
                    activeTab === 'preferences'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`px-4 py-3 text-left text-sm font-medium ${
                    activeTab === 'account'
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Account
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileForm />}
            {activeTab === 'password' && <PasswordChangeForm />}
            {activeTab === 'preferences' && <UserSettingsForm />}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Management</h2>
                  <p className="text-gray-600 mb-4">
                    Manage your account settings and connected services.
                  </p>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Connected Services</h3>
                    <p className="text-gray-600 mb-4">
                      No connected services yet. You'll be able to connect third-party services here in the future.
                    </p>
                  </div>
                </div>
                
                <AccountDeletionForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
