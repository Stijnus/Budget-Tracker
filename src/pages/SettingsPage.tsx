import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
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
  Settings,
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
} from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { t } = useTranslation();

  // Helper function to get the appropriate icon based on tab value
  const getTabIcon = (value: string) => {
    switch (value) {
      case "profile":
        return <User className="w-4 h-4 mr-2" />;
      case "password":
        return <KeyRound className="w-4 h-4 mr-2" />;
      case "preferences":
        return <Settings className="w-4 h-4 mr-2" />;
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
        return <Settings className="w-4 h-4 mr-2" />;
    }
  };

  // Settings tab items
  const tabItems = [
    { value: "profile", label: t("settings.profile") },
    { value: "password", label: t("settings.password") },
    { value: "preferences", label: t("settings.preferences") },
    { value: "notifications", label: t("settings.notifications") },
    { value: "currency", label: t("settings.currency") },
    { value: "theme", label: t("settings.theme") },
    { value: "language", label: t("settings.language") },
    { value: "account", label: t("settings.account") },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-6 px-4 md:px-6 bg-background">
        {/* Main container */}
        <div className="flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto">
          {/* Left column - Settings menu */}
          <div
            className={cn(
              "w-full md:w-72 lg:w-80 flex-shrink-0",
              isMobile && activeTab !== "profile" ? "hidden" : "block"
            )}
          >
            <Card className="shadow-sm border bg-card">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-xl font-semibold">
                  {t("settings.title")}
                </CardTitle>
                <CardDescription>{t("settings.description")}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <ScrollArea className="h-auto max-h-[calc(100vh-300px)]">
                  <div className="flex flex-col py-2">
                    {tabItems.map((item) => (
                      <Button
                        key={item.value}
                        variant="ghost"
                        className={cn(
                          "justify-start rounded-none relative text-muted-foreground h-auto py-3",
                          "border-l-2 border-transparent px-5",
                          activeTab === item.value &&
                            "bg-muted/50 border-l-primary text-primary font-medium"
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
                                  ? "rotate-90 text-primary"
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
                <Button variant="outline" size="sm" className="w-full text-sm">
                  {t("common.help")}
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
                onClick={() => setActiveTab("profile")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.goBack")}
              </Button>
            )}

            {/* Content */}
            <div className="space-y-6">
              {/* Page header */}
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2">
                  {getTabIcon(activeTab)}
                  <h1 className="text-2xl font-bold tracking-tight">
                    {tabItems.find((item) => item.value === activeTab)?.label}
                  </h1>
                </div>
                <p
                  className="text-muted-foreground mt-1"
                  data-i18n-key={`settings.${activeTab}.description`}
                >
                  {t(`settings.${activeTab}.description`)}
                </p>
              </div>

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
                    <Card className="border shadow-sm">
                      <CardHeader>
                        <CardTitle>{t("settings.connectedServices")}</CardTitle>
                        <CardDescription>
                          {t("settings.connectedServicesDescription")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col divide-y">
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-muted rounded-full p-2">
                                <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {t("settings.bankingIntegration")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {t("settings.bankingIntegrationDescription")}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              {t("settings.connect")}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-muted rounded-full p-2">
                                <ShieldAlert className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {t("settings.twoFactorAuth")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {t("settings.twoFactorAuthDescription")}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              {t("settings.setup")}
                            </Button>
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                              <div className="bg-muted rounded-full p-2">
                                <RefreshCw className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {t("settings.dataSync")}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />{" "}
                                  {t("settings.lastSynced", {
                                    time: "5 minutes",
                                  })}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              {t("settings.syncNow")}
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
