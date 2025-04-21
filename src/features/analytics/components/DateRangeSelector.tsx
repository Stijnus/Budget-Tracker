import { useState } from 'react';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangeSelector({ 
  startDate, 
  endDate, 
  onDateRangeChange,
  className = '' 
}: DateRangeSelectorProps) {
  const [customRange, setCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(startDate);
  const [customEndDate, setCustomEndDate] = useState(endDate);

  // Predefined date ranges
  const handleRangeSelect = (range: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (range) {
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last-year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        setCustomRange(true);
        return;
      default:
        // Last 30 days
        start = new Date();
        start.setDate(start.getDate() - 30);
        end = now;
    }
    
    setCustomRange(false);
    const formattedStart = start.toISOString().split('T')[0];
    const formattedEnd = end.toISOString().split('T')[0];
    
    setCustomStartDate(formattedStart);
    setCustomEndDate(formattedEnd);
    onDateRangeChange(formattedStart, formattedEnd);
  };

  // Handle custom date range
  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Date Range
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleRangeSelect('this-month')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          This Month
        </button>
        <button
          onClick={() => handleRangeSelect('last-month')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Last Month
        </button>
        <button
          onClick={() => handleRangeSelect('this-quarter')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          This Quarter
        </button>
        <button
          onClick={() => handleRangeSelect('this-year')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          This Year
        </button>
        <button
          onClick={() => handleRangeSelect('last-year')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Last Year
        </button>
        <button
          onClick={() => handleRangeSelect('custom')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Custom
        </button>
      </div>
      
      {customRange && (
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleCustomDateChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        Current range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
      </div>
    </div>
  );
}
