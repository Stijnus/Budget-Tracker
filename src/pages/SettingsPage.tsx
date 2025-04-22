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
} from "../features/auth/components";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the tabs
type SettingsTab =
  | "profile"
  | "password"
  | "preferences"
  | "notifications"
  | "currency"
  | "theme"
  | "account";

export function SettingsPage() {
  // We'll use the Tabs component's built-in state management

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <Tabs
          defaultValue="profile"
          className="w-full"
          // Tab changes are handled internally by the Tabs component
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <Card>
                <CardContent className="p-0">
                  <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-0">
                    <TabsTrigger
                      value="profile"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Profile Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Password
                    </TabsTrigger>
                    <TabsTrigger
                      value="preferences"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Preferences
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="currency"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Currency
                    </TabsTrigger>
                    <TabsTrigger
                      value="theme"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Theme
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      className={cn(
                        "justify-start rounded-none border-l-2 border-transparent px-4 py-3 data-[state=active]:border-primary",
                        "data-[state=active]:bg-muted data-[state=active]:text-primary"
                      )}
                    >
                      Account
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="flex-1">
              <TabsContent value="profile" className="m-0">
                <ProfileForm />
              </TabsContent>
              <TabsContent value="password" className="m-0">
                <PasswordChangeForm />
              </TabsContent>
              <TabsContent value="preferences" className="m-0">
                <UserSettingsForm />
              </TabsContent>
              <TabsContent value="notifications" className="m-0">
                <NotificationSettingsForm />
              </TabsContent>
              <TabsContent value="currency" className="m-0">
                <CurrencySettingsForm />
              </TabsContent>
              <TabsContent value="theme" className="m-0">
                <ThemeSettingsForm />
              </TabsContent>
              <TabsContent value="account" className="m-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Management</CardTitle>
                      <CardDescription>
                        Manage your account settings and connected services.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-2">
                          Connected Services
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          No connected services yet. You'll be able to connect
                          third-party services here in the future.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <AccountDeletionForm />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
