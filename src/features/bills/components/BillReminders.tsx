import { useState, useEffect } from "react";
import { Calendar, AlertCircle, Bell, CheckCircle2 } from "lucide-react";
import { getBills, markBillAsPaid } from "../../../api/supabase/bills";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface BillRemindersProps {
  limit?: number;
  className?: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  next_due_date: string | null;
  status: string;
}

export function BillReminders({
  limit = 5,
  className = "",
}: BillRemindersProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBills() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getBills();

        if (error) {
          throw error;
        }

        // Sort bills by due date (closest first)
        const sortedBills = (data || [])
          .filter((bill) => bill.next_due_date && bill.status === "active")
          .sort((a, b) => {
            const dateA = new Date(a.next_due_date || new Date());
            const dateB = new Date(b.next_due_date || new Date());
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, limit);

        setBills(sortedBills);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to load upcoming bills");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBills();
  }, [limit]);

  const handleMarkAsPaid = async (billId: string) => {
    try {
      const { error } = await markBillAsPaid(billId);

      if (error) {
        throw error;
      }

      // Update the local state
      setBills((prevBills) => prevBills.filter((bill) => bill.id !== billId));
    } catch (err) {
      console.error("Error marking bill as paid:", err);
      setError("Failed to mark bill as paid");
    }
  };

  const isDueSoon = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 5;
  };

  const isOverdue = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Bill Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            No upcoming bills due soon.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Bill Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{bill.name}</h3>
                  {bill.next_due_date && isOverdue(bill.next_due_date) && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                  {bill.next_due_date &&
                    !isOverdue(bill.next_due_date) &&
                    isDueSoon(bill.next_due_date) && (
                      <Badge
                        variant="outline"
                        className="ml-2 border-yellow-500 text-yellow-600"
                      >
                        Due Soon
                      </Badge>
                    )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    Due:{" "}
                    {bill.next_due_date
                      ? formatDate(bill.next_due_date, "medium")
                      : "N/A"}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(bill.amount)}
                </p>
              </div>
              <Button
                onClick={() => handleMarkAsPaid(bill.id)}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <CheckCircle2 size={14} className="mr-1" />
                Mark Paid
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
