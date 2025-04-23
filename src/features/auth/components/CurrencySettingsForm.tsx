import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserSettings } from "../../../api/supabase/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Currency options
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", format: "$1,234.56" },
  { code: "EUR", symbol: "€", name: "Euro", format: "€1.234,56" },
  { code: "GBP", symbol: "£", name: "British Pound", format: "£1,234.56" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", format: "¥1,235" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", format: "C$1,234.56" },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    format: "A$1,234.56",
  },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", format: "Fr 1'234.56" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", format: "¥1,234.56" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", format: "₹1,234.56" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", format: "R$1.234,56" },
];

export function CurrencySettingsForm() {
  const { user, userSettings, refreshUserData } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize form with user settings
  useEffect(() => {
    if (userSettings) {
      setCurrency(userSettings.currency || "USD");
    }
  }, [userSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserSettings(user.id, {
        currency,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({
          text: "Currency settings updated successfully",
          type: "success",
        });
        // Refresh user data to update the UI
        if (refreshUserData) {
          await refreshUserData();
        }
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <Card className="border-t-4 border-t-violet-500">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-violet-500" />
          Currency Settings
        </CardTitle>
        <CardDescription>
          Choose your preferred currency for the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
            className="mb-4"
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Select Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used for displaying all monetary values throughout
              the application
            </p>
          </div>

          <div className="border rounded-md p-4 bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Currency Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Symbol:</span>
                <span className="text-sm font-medium">
                  {selectedCurrency.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Code:</span>
                <span className="text-sm font-medium">
                  {selectedCurrency.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Format:</span>
                <span className="text-sm font-medium">
                  {selectedCurrency.format}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Example</TableHead>
                  <TableHead>Formatted Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Positive Amount</TableCell>
                  <TableCell>{selectedCurrency.symbol}1,234.56</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Negative Amount</TableCell>
                  <TableCell>-{selectedCurrency.symbol}1,234.56</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Zero Amount</TableCell>
                  <TableCell>{selectedCurrency.symbol}0.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Currency Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
