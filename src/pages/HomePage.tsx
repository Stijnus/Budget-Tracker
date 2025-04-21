import { useState } from 'react';

function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Budget Tracker</h1>
        <p className="text-xl text-center mt-2 text-gray-600">
          Your personal finance management app
        </p>
      </header>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Your Fresh Start</h2>
        <p className="mb-4">
          This is a brand new Budget Tracker application. You're starting from scratch!
        </p>
        
        <div className="flex flex-col items-center justify-center mt-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Count: {count}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Click the button to see React working
          </p>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Budget Tracker
      </footer>
    </div>
  );
}

export default HomePage;
