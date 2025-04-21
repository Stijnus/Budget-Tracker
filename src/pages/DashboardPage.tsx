import { useAuth } from '../state/auth';
import { AppLayout } from '../shared/components/layout';

export function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {userProfile?.full_name || 'User'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Dashboard content placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Financial overview card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Income</span>
                <span className="font-medium text-green-600">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600 font-medium">Balance</span>
                <span className="font-medium text-blue-600">$0.00</span>
              </div>
            </div>
          </div>

          {/* Budget progress card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Food & Dining</span>
                  <span className="text-sm font-medium text-gray-800">$0 / $500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Transportation</span>
                  <span className="text-sm font-medium text-gray-800">$0 / $300</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Entertainment</span>
                  <span className="text-sm font-medium text-gray-800">$0 / $200</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Goals card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Goals</h3>
            <div className="text-center py-8">
              <p className="text-gray-500">No goals set yet</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                Create a Goal
              </button>
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
