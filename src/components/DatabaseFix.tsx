import { useState, useEffect } from "react";
import { supabase } from "../api/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function DatabaseFix() {
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "checking" | "fixing" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setIsChecking(true);
    setStatus("checking");
    setError(null);

    try {
      // Check if budget_groups table exists using RPC instead of direct information_schema query
      const { data: tableExists, error: tableError } = await supabase.rpc(
        "check_table_exists",
        { table_name: "budget_groups" }
      );

      if (tableError) {
        throw tableError;
      }

      if (!tableExists) {
        setStatus("error");
        setError(
          'Budget groups tables are missing. Click "Fix Database" to create them.'
        );
      } else {
        setStatus("success");
      }
    } catch (err: unknown) {
      console.error("Error checking database:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to check database tables"
      );
    } finally {
      setIsChecking(false);
    }
  };

  const fixDatabase = async () => {
    setIsFixing(true);
    setStatus("fixing");
    setError(null);

    try {
      // Create budget_groups table
      await supabase.rpc("create_budget_groups_tables");

      setStatus("success");
    } catch (err: unknown) {
      console.error("Error fixing database:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to fix database tables"
      );
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="space-y-4">
      {status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === "success" && (
        <Alert>
          <AlertTitle>Database Check</AlertTitle>
          <AlertDescription>
            Database tables are properly set up.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Button onClick={checkDatabase} disabled={isChecking || isFixing}>
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Database"
          )}
        </Button>

        <Button
          onClick={fixDatabase}
          disabled={isChecking || isFixing || status === "success"}
        >
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing...
            </>
          ) : (
            "Fix Database"
          )}
        </Button>
      </div>
    </div>
  );
}
