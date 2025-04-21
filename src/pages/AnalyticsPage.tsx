import { useState } from 'react';
import { AppLayout } from '../shared/components/layout';
import { DateRangeSelector } from '../features/analytics/components/DateRangeSelector';
import { ExpenseCategoryChart } from '../features/analytics/components/ExpenseCategoryChart';
import { SpendingTrendChart } from '../features/analytics/components/SpendingTrendChart';
import { IncomeExpenseChart } from '../features/analytics/components/IncomeExpenseChart';
import { BudgetComparisonChart } from '../features/analytics/components/BudgetComparisonChart';

export function AnalyticsPage() {
  // Default to current month
  const now = new Date();
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  );
  
  // Handle date range changes
  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Financial Analytics
          </h2>
        </div>
        
        {/* Date Range Selector */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Category Chart */}
          <ExpenseCategoryChart
            startDate={startDate}
            endDate={endDate}
          />
          
          {/* Income vs Expenses Chart */}
          <IncomeExpenseChart
            startDate={startDate}
            endDate={endDate}
          />
          
          {/* Spending Trend Chart */}
          <SpendingTrendChart
            startDate={startDate}
            endDate={endDate}
            groupBy="month"
            className="lg:col-span-2"
          />
          
          {/* Budget Comparison Chart */}
          <BudgetComparisonChart
            className="lg:col-span-2"
          />
        </div>
      </div>
    </AppLayout>
  );
}
