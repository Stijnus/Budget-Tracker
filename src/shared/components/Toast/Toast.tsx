import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  // Auto-close the toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Get icon and styles based on toast type
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={20} />,
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          iconColor: "text-green-500",
          borderColor: "border-green-200",
        };
      case "error":
        return {
          icon: <AlertCircle size={20} />,
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          iconColor: "text-red-500",
          borderColor: "border-red-200",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={20} />,
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-500",
          borderColor: "border-yellow-200",
        };
      case "info":
      default:
        return {
          icon: <Info size={20} />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
          borderColor: "border-blue-200",
        };
    }
  };

  const { icon, bgColor, textColor, iconColor, borderColor } = getToastStyles();

  return (
    <div
      className={`flex items-center p-4 mb-3 rounded-md shadow-md border ${bgColor} ${borderColor} transform transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className={`flex-shrink-0 mr-3 ${iconColor}`}>{icon}</div>
      <div className={`flex-grow ${textColor}`}>{message}</div>
      <button
        onClick={() => onClose(id)}
        className={`ml-3 ${textColor} hover:text-gray-500 focus:outline-none`}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
