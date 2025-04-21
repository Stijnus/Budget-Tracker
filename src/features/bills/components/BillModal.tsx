import { useState } from "react";
import { X } from "lucide-react";
import {
  BillWithCategory,
  BillInsert,
  createBill,
  updateBill,
} from "../../../api/supabase/bills";
import { BillForm } from "./BillForm";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill?: BillWithCategory;
  onSuccess: () => void;
}

export function BillModal({
  isOpen,
  onClose,
  bill,
  onSuccess,
}: BillModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (billData: BillInsert) => {
    try {
      setError(null);

      if (bill) {
        // Update existing bill
        const { error } = await updateBill(bill.id, billData);
        if (error) throw error;
      } else {
        // Create new bill
        const { error } = await createBill(billData);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving bill:", err);
      setError("Failed to save bill. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {bill ? "Edit Bill" : "Add New Bill"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <BillForm bill={bill} onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}
