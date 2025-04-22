import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Predefined colors
const COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Light Blue
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#6B7280", // Gray
  "#1F2937", // Dark Gray
  "#000000", // Black
];

interface CategoryColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function CategoryColorPicker({
  color,
  onChange,
}: CategoryColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Update custom color when color prop changes
  useEffect(() => {
    setCustomColor(color);
  }, [color]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle color selection
  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    setIsOpen(false);
  };

  // Handle custom color change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-10 h-10 p-0"
              style={{ backgroundColor: color }}
              aria-label="Select color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((colorOption) => (
                <Button
                  key={colorOption}
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-10 h-10 p-0",
                    colorOption === color
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:ring-2 hover:ring-muted"
                  )}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => handleColorSelect(colorOption)}
                  aria-label={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          type="text"
          value={customColor}
          onChange={handleCustomColorChange}
          className="flex-1"
          placeholder="#RRGGBB"
        />
        <Input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-10 h-10 p-0 cursor-pointer"
          aria-label="Pick custom color"
        />
      </div>
    </div>
  );
}
