import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { formatDate } from "../utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CalendarIcon } from "lucide-react";
import {
  DateRangeSelector,
  ExpenseCategoryChart,
  IncomeExpenseChart,
  SpendingTrendChart,
  BudgetComparisonChart,
  SavingsRateChart,
} from "../features/analytics/components";

export function AnalyticsPage() {
  // Default to current month
  const now = new Date();
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0]
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
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-500" />
            <h2 className="text-2xl font-bold">Financial Analytics</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>

        {/* Date Range Selector */}
        <Card className="border-t-4 border-t-teal-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-teal-500" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Category Chart */}
          <Card className="border-t-4 border-t-teal-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-teal-500" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseCategoryChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>

          {/* Income vs Expenses Chart */}
          <Card className="border-t-4 border-t-teal-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-teal-500" />
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>

          {/* Spending Trend Chart */}
          <Card className="border-t-4 border-t-teal-500 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-teal-500" />
                Spending Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingTrendChart
                startDate={startDate}
                endDate={endDate}
                groupBy="month"
              />
            </CardContent>
          </Card>

          {/* Savings Rate Chart */}
          <Card className="border-t-4 border-t-teal-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-teal-500" />
                Savings Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsRateChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>

          {/* Budget Comparison Chart */}
          <Card className="border-t-4 border-t-teal-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-teal-500" />
                Budget Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetComparisonChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
