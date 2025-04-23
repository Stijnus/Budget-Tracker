import { useState, useEffect } from "react";
import { supabase } from "@/api/supabase/client";

interface BankAccount {
  id: string;
  user_id: string;
  name: string;
  account_type: "checking" | "savings" | "credit" | "investment" | "other";
  institution: string | null;
  account_number: string | null;
  current_balance: number;
  currency: string;
  is_default: boolean;
  notes: string | null;
  color: string | null;
  icon: string | null;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export const useBankAccounts = () => {
  const [data, setData] = useState<BankAccount[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const { data: accounts, error } = await supabase
          .from("bank_accounts")
          .select("*");

        if (error) throw error;
        setData(accounts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch bank accounts")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, []);

  return { data, error, loading };
};
