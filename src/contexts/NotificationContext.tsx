import { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  hasUnreadNotifications: boolean;
  addNotification: (
    title: string,
    message: string,
    type: NotificationType
  ) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    title: string,
    message: string,
    type: NotificationType
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.read
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnreadNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
