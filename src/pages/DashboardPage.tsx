import { useState } from "react";
import { useAuth } from "../state/useAuth";
import { useLanguage } from "../providers/LanguageProvider";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { BudgetSummary } from "../features/budgets/components/BudgetSummary";
import { SpendingSummary } from "../features/dashboard/components/SpendingSummary";
import { BillReminders } from "../features/bills/components/BillReminders";
import { GoalsList } from "../features/goals/components/GoalsList";
import { ExpenseCategoryChart } from "../features/analytics/components/ExpenseCategoryChart";
import { formatDate } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Bell,
  Target,
  PieChart,
  ArrowRight,
} from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  // Get the current date for the expense category chart
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startDate = firstDayOfMonth.toISOString().split("T")[0];
  const endDate = lastDayOfMonth.toISOString().split("T")[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with welcome message and date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("dashboard.welcome")},{" "}
              {user?.user_metadata?.full_name || t("common.user")}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(new Date(), "long")}
            </p>
          </div>

          {/* Dashboard tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.overview")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="finances" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("dashboard.finances")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">{t("dashboard.goals")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Monthly spending summary */}
              <SpendingSummary />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Bill reminders */}
                <Card className="md:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Bell className="mr-2 h-5 w-5" />
                      {t("dashboard.billReminders")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => (window.location.href = "/bills")}
                    >
                      {t("common.viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BillReminders limit={3} />
                  </CardContent>
                </Card>

                {/* Budget summary */}
                <Card className="md:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PiggyBank className="mr-2 h-5 w-5" />
                      {t("dashboard.budgetProgress")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => (window.location.href = "/budgets")}
                    >
                      {t("common.viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BudgetSummary />
                  </CardContent>
                </Card>

                {/* Expense categories */}
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PieChart className="mr-2 h-5 w-5" />
                      {t("dashboard.expenseCategories")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => (window.location.href = "/analytics")}
                    >
                      {t("common.viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ExpenseCategoryChart
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent transactions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t("dashboard.recent")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => (window.location.href = "/transactions")}
                  >
                    {t("common.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <TransactionList limit={5} showAddButton={true} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Finances Tab */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              {/* Monthly spending summary */}
              <SpendingSummary />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PiggyBank className="mr-2 h-5 w-5" />
                      {t("dashboard.budgetProgress")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => (window.location.href = "/budgets")}
                    >
                      {t("common.viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <BudgetSummary />
                  </CardContent>
                </Card>

                {/* Expense categories */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PieChart className="mr-2 h-5 w-5" />
                      {t("dashboard.expenseCategories")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => (window.location.href = "/analytics")}
                    >
                      {t("common.viewAll")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ExpenseCategoryChart
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Recent transactions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t("dashboard.recent")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => (window.location.href = "/transactions")}
                  >
                    {t("common.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <TransactionList limit={5} showAddButton={true} />
                </CardContent>
              </Card>

              {/* Bill reminders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    {t("dashboard.billReminders")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => (window.location.href = "/bills")}
                  >
                    {t("common.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <BillReminders limit={5} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div className="space-y-6">
              {/* Goals list */}
              <GoalsList showAddButton={true} />

              {/* Bill reminders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    {t("dashboard.billReminders")}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => (window.location.href = "/bills")}
                  >
                    {t("common.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <BillReminders limit={3} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
