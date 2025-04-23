import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function WelcomeModal({
  isOpen,
  onClose,
  userName = "there",
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const { t } = useTranslation("welcome");

  if (!isOpen) return null;

  const steps = [
    {
      title: t("welcome.title"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            {t("welcome.greeting", { name: userName })}
          </p>
          <p className="text-gray-700">{t("welcome.tour")}</p>
        </div>
      ),
    },
    {
      title: t("welcome.transactions.title"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            {t("welcome.transactions.description")}
          </p>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700 font-medium">
              {t("welcome.transactions.proTip")}
            </p>
            <p className="text-blue-700">
              {t("welcome.transactions.shortcut", {
                key: <kbd className="px-1 bg-blue-100">N + T</kbd>,
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("welcome.budgets.title"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t("welcome.budgets.description")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="font-medium text-green-800 mb-1">
                {t("welcome.budgets.budgetsTitle")}
              </h4>
              <p className="text-green-700 text-sm">
                {t("welcome.budgets.budgetsDescription")}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-md">
              <h4 className="font-medium text-purple-800 mb-1">
                {t("welcome.budgets.goalsTitle")}
              </h4>
              <p className="text-purple-700 text-sm">
                {t("welcome.budgets.goalsDescription")}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("welcome.bills.title"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t("welcome.bills.description")}</p>
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <p className="text-yellow-700">{t("welcome.bills.reminder")}</p>
          </div>
          <p className="text-gray-700">{t("welcome.bills.ready")}</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {steps[currentStep].title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8">{steps[currentStep].content}</div>

        {/* Progress indicators */}
        <div className="flex justify-center mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentStep
                  ? "bg-blue-600"
                  : index < currentStep
                  ? "bg-blue-300"
                  : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>

        <div className="flex justify-between">
          <div>
            {currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <ChevronLeft size={16} className="mr-1" />
                {t("welcome.navigation.back")}
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                {t("welcome.navigation.skip")}
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                {t("welcome.navigation.getStarted")}
                <Check size={16} className="ml-1" />
              </>
            ) : (
              <>
                {t("welcome.navigation.next")}
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
