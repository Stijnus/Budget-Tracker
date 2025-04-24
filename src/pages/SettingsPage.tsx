import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "../shared/components/layout";
import { formatDate } from "../utils/formatters";
import {
  ProfileForm,
  PasswordChangeForm,
  AccountDeletionForm,
  UserSettingsForm,
  NotificationSettingsForm,
  CurrencySettingsForm,
  ThemeSettingsForm,
  LanguageSettingsForm,
} from "../features/auth/components";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Languages,
  KeyRound,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  CalendarIcon,
  Cog,
} from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
// Translation imports removed

import { useMemo } from "react";

export function SettingsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "profile");

  // Settings tab items
  interface TabItem {
    value: string;
    label: string;
  }
  const tabItems: TabItem[] = useMemo(() => [
    { value: "profile", label: "Profile" },
    { value: "password", label: "Password" },
    { value: "preferences", label: "Preferences" },
    { value: "notifications", label: "Notifications" },
    { value: "currency", label: "Currency" },
    { value: "theme", label: "Theme" },
    { value: "language", label: "Language" },
    { value: "account", label: "Account" },
  ], []);

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tab && tabItems.some((item: TabItem) => item.value === tab)) {
      setActiveTab(tab);
    }
  }, [tab, tabItems]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Translation hooks removed

  // Helper function to get the appropriate description based on tab value
  const getSettingsDescription = (value: string) => {
    switch (value) {
      case "profile":
        return "Manage your personal information and profile settings";
      case "password":
        return "Update your password and security settings";
      case "preferences":
        return "Customize your app experience and default settings";
      case "notifications":
        return "Control how and when you receive notifications";
      case "currency":
        return "Set your preferred currency and format options";
      case "theme":
        return "Choose your preferred theme and appearance settings";
      case "language":
        return "Select your preferred language for the application";
      case "account":
        return "Manage your account security and connected services";
      default:
        return "Manage your settings and preferences";
    }
  };

  // Helper function to get the appropriate icon based on tab value
  const getTabIcon = (value: string) => {
    switch (value) {
      case "profile":
        return <User className="w-4 h-4 mr-2" />;
      case "password":
        return <KeyRound className="w-4 h-4 mr-2" />;
      case "preferences":
        return <SettingsIcon className="w-4 h-4 mr-2" />;
      case "notifications":
        return <Bell className="w-4 h-4 mr-2" />;
      case "currency":
        return <CreditCard className="w-4 h-4 mr-2" />;
      case "theme":
        return <Palette className="w-4 h-4 mr-2" />;
      case "language":
        return <Languages className="w-4 h-4 mr-2" />;
      case "account":
        return <Shield className="w-4 h-4 mr-2" />;
      default:
        return <SettingsIcon className="w-4 h-4 mr-2" />;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/settings/${value}`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-violet-500" />
            <h2 className="text-2xl font-bold">Settings</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>

        {/* Main container */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Settings menu */}
          <div
            className={cn(
              "w-full md:w-72 lg:w-80 flex-shrink-0",
              isMobile && activeTab !== "profile" ? "hidden" : "block"
            )}
          >
            <Card className="border-l-4 border-l-violet-500 shadow-sm">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <SettingsIcon className="mr-2 h-5 w-5 text-violet-500" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-auto max-h-[calc(100vh-300px)]">
                  <div className="flex flex-col py-2">
                    {tabItems.map((item: TabItem) => (
                      <Button
                        key={item.value}
                        variant="ghost"
                        className={cn(
                          "justify-start rounded-none relative text-muted-foreground h-auto py-3",
                          "border-l-2 border-transparent px-5",
                          activeTab === item.value &&
                            "bg-violet-50 border-l-violet-500 text-violet-700 font-medium"
                        )}
                        onClick={() => handleTabChange(item.value)}
                      >
                        <div className="flex items-center w-full justify-between">
                          <div className="flex items-center">
                            {getTabIcon(item.value)}
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.value === "notifications" && (
                              <Badge
                                variant="secondary"
                                className="ml-auto text-xs font-normal"
                              >
                                New
                              </Badge>
                            )}
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 opacity-50",
                                activeTab === item.value
                                  ? "rotate-90 text-violet-700"
                                  : ""
                              )}
                            />
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <Separator />
              <CardFooter className="p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  Help & Support
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Content area */}
          <div
            className={cn(
              "flex-1",
              isMobile && activeTab === "profile" ? "hidden" : "block"
            )}
          >
            {/* Mobile back button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 items-center md:hidden"
                onClick={() => navigate("/settings/profile")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}

            {/* Content */}
            <div className="space-y-6">
              {/* Page header */}
              <Card className="border-t-4 border-t-violet-500 mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-violet-100 p-2 rounded-full">
                      {getTabIcon(activeTab)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {
                          tabItems.find((item: TabItem) => item.value === activeTab)
                            ?.label
                        }
                      </CardTitle>
                      <CardDescription>
                        {getSettingsDescription(activeTab)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs content */}
              <div>
                {activeTab === "profile" && <ProfileForm />}
                {activeTab === "password" && <PasswordChangeForm />}
                {activeTab === "preferences" && <UserSettingsForm />}
                {activeTab === "notifications" && <NotificationSettingsForm />}
                {activeTab === "currency" && <CurrencySettingsForm />}
                {activeTab === "theme" && <ThemeSettingsForm />}
                {activeTab === "language" && <LanguageSettingsForm />}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <Card className="border-t-4 border-t-violet-500 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-violet-500" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>
                          Manage your connected accounts and services
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col divide-y">
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-violet-100 rounded-full p-2">
                                <CreditCard className="w-5 h-5 text-violet-500" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Banking Integration
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Connect your bank accounts for automatic
                                  transaction import
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-violet-200 text-violet-700 hover:bg-violet-50"
                            >
                              Connect
                            </Button>
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-violet-100 rounded-full p-2">
                                <ShieldAlert className="w-5 h-5 text-violet-500" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Two-Factor Authentication
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Add an extra layer of security to your account
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-violet-200 text-violet-700 hover:bg-violet-50"
                            >
                              Setup
                            </Button>
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-violet-100 rounded-full p-2">
                                <RefreshCw className="w-5 h-5 text-violet-500" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Data Synchronization
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />{" "}
                                  Last synced 5 minutes ago
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-violet-200 text-violet-700 hover:bg-violet-50"
                            >
                              Sync Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <AccountDeletionForm />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
