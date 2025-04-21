import { X, HelpCircle, Keyboard } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <HelpCircle size={24} className="mr-2 text-blue-600" />
            Help & Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Keyboard Shortcuts Section */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Keyboard size={20} className="mr-2 text-blue-600" />
              Keyboard Shortcuts
            </h3>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <h4 className="font-medium text-gray-700 mb-2">Navigation</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Go to Dashboard</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        G + D
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Go to Transactions</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        G + T
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Go to Budgets</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        G + B
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Go to Goals</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        G + G
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Go to Bills</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        G + S
                      </kbd>
                    </li>
                  </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-600">New Transaction</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        N + T
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">New Budget</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        N + B
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">New Goal</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        N + G
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Search</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        /
                      </kbd>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Help</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-sm">
                        ?
                      </kbd>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Section */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Getting Started
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  1. Track Your Transactions
                </h4>
                <p className="text-blue-700">
                  Start by adding your income and expenses in the Transactions
                  section. You can categorize them and add tags for better
                  organization.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">
                  2. Create Budgets
                </h4>
                <p className="text-green-700">
                  Set up monthly budgets for different categories to help you
                  manage your spending and stay on track with your financial
                  goals.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <h4 className="font-medium text-purple-800 mb-2">
                  3. Set Financial Goals
                </h4>
                <p className="text-purple-700">
                  Define your financial goals like saving for a vacation, buying
                  a car, or building an emergency fund. Track your progress and
                  make regular contributions.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">
                  4. Manage Bills & Subscriptions
                </h4>
                <p className="text-yellow-700">
                  Keep track of your recurring bills and subscriptions to avoid
                  late payments and manage your cash flow better.
                </p>
              </div>
            </div>
          </section>

          {/* Tips & Tricks Section */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tips & Tricks
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 mt-1"></span>
                <span>
                  Use tags to further categorize your transactions for more
                  detailed reporting.
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2 mt-1"></span>
                <span>
                  Review your spending patterns on the Dashboard to identify
                  areas where you can save money.
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-500 rounded-full mr-2 mt-1"></span>
                <span>
                  Set up realistic budgets based on your historical spending to
                  increase your chances of success.
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2 mt-1"></span>
                <span>
                  Make regular contributions to your financial goals, even if
                  they're small amounts.
                </span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2 mt-1"></span>
                <span>
                  Use the mobile view to track expenses on the go and stay on
                  top of your finances.
                </span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
