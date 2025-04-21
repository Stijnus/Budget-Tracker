export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-500">
          &copy; {currentYear} Budget Tracker. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-700 mr-4">Privacy Policy</a>
          <a href="#" className="hover:text-gray-700 mr-4">Terms of Service</a>
          <a href="#" className="hover:text-gray-700">Contact</a>
        </div>
      </div>
    </footer>
  );
}
