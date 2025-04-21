import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LoginForm,
  RegisterForm,
  PasswordResetForm,
} from "../features/auth/components";

type AuthView = "login" | "register" | "reset-password";

export function LandingPage() {
  const location = useLocation();
  const pathname = location.pathname;

  // Determine which form to show based on the URL path
  let initialView: AuthView = "login";
  if (pathname === "/register") initialView = "register";
  if (pathname === "/forgot-password" || pathname === "/reset-password")
    initialView = "reset-password";

  // We're using the view state but not changing it in this version
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [view, setView] = useState<AuthView>(initialView);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Feature highlights */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Budget Tracker</h1>
          <p className="text-xl mb-12">
            Take control of your finances with our powerful budgeting and
            expense tracking tools.
          </p>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Track Your Expenses
                </h3>
                <p className="text-blue-100">
                  Easily log and categorize your expenses to see where your
                  money is going.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Set Budgets</h3>
                <p className="text-blue-100">
                  Create custom budgets for different categories and track your
                  progress.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Visualize Your Finances
                </h3>
                <p className="text-blue-100">
                  Get insights with beautiful charts and reports to help you
                  make better financial decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Achieve Your Goals
                </h3>
                <p className="text-blue-100">
                  Set financial goals and track your progress towards achieving
                  them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        {view === "login" && <LoginForm />}
        {view === "register" && <RegisterForm />}
        {view === "reset-password" && <PasswordResetForm />}
      </div>
    </div>
  );
}
