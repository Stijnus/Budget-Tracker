import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
  className = "",
}: DateRangeSelectorProps) {
  const [customRange, setCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(startDate);
  const [customEndDate, setCustomEndDate] = useState(endDate);

  // Predefined date ranges
  const handleRangeSelect = (range: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "this-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "last-month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this-quarter": {
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      }
      case "this-year":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case "last-year":
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "custom":
        setCustomRange(true);
        return;
      default:
        // Last 30 days
        start = new Date();
        start.setDate(start.getDate() - 30);
        end = now;
    }

    setCustomRange(false);
    const formattedStart = start.toISOString().split("T")[0];
    const formattedEnd = end.toISOString().split("T")[0];

    setCustomStartDate(formattedStart);
    setCustomEndDate(formattedEnd);
    onDateRangeChange(formattedStart, formattedEnd);
  };

  // Handle custom date range
  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => handleRangeSelect("this-month")}
            variant="outline"
            size="sm"
          >
            This Month
          </Button>
          <Button
            onClick={() => handleRangeSelect("last-month")}
            variant="outline"
            size="sm"
          >
            Last Month
          </Button>
          <Button
            onClick={() => handleRangeSelect("this-quarter")}
            variant="outline"
            size="sm"
          >
            This Quarter
          </Button>
          <Button
            onClick={() => handleRangeSelect("this-year")}
            variant="outline"
            size="sm"
          >
            This Year
          </Button>
          <Button
            onClick={() => handleRangeSelect("last-year")}
            variant="outline"
            size="sm"
          >
            Last Year
          </Button>
          <Button
            onClick={() => handleRangeSelect("custom")}
            variant="outline"
            size="sm"
          >
            Custom
          </Button>
        </div>

        {customRange && (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                type="date"
                id="start-date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                type="date"
                id="end-date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleCustomDateChange}>Apply</Button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {new Date(startDate).toLocaleDateString()} -{" "}
            {new Date(endDate).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
