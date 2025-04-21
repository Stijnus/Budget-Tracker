import { useState, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { HelpModal } from "./HelpModal";

interface KeyboardShortcutsContextType {
  isHelpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextType | undefined
>(undefined);

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const navigate = useNavigate();

  // Define keyboard shortcuts
  useKeyboardShortcut(
    {
      // Navigation shortcuts
      "g+d": () => navigate("/dashboard"),
      "g+t": () => navigate("/transactions"),
      "g+b": () => navigate("/budgets"),
      "g+g": () => navigate("/goals"),
      "g+s": () => navigate("/bills"),

      // Action shortcuts
      "n+t": () => navigate("/transactions/new"),
      "n+b": () => navigate("/budgets/new"),
      "n+g": () => navigate("/goals"),

      // Help shortcut
      "?": () => setIsHelpModalOpen(true),
    },
    { disabled: isHelpModalOpen }
  );

  const openHelpModal = () => setIsHelpModalOpen(true);
  const closeHelpModal = () => setIsHelpModalOpen(false);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ isHelpModalOpen, openHelpModal, closeHelpModal }}
    >
      {children}
      <HelpModal isOpen={isHelpModalOpen} onClose={closeHelpModal} />
    </KeyboardShortcutsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error(
      "useKeyboardShortcuts must be used within a KeyboardShortcutsProvider"
    );
  }
  return context;
}
