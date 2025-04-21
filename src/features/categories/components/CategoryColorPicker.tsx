import { useState, useEffect, useRef } from 'react';

// Predefined colors
const COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Light Blue
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
  '#000000', // Black
];

interface CategoryColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function CategoryColorPicker({ color, onChange }: CategoryColorPickerProps) {
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
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center"
          style={{ backgroundColor: color }}
          aria-label="Select color"
        ></button>
        <input
          type="text"
          value={customColor}
          onChange={handleCustomColorChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="#RRGGBB"
        />
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer"
          aria-label="Pick custom color"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-2 bg-white rounded-md shadow-lg border border-gray-200 grid grid-cols-5 gap-2 w-64">
          {COLORS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              onClick={() => handleColorSelect(colorOption)}
              className={`w-10 h-10 rounded-md ${
                colorOption === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'
              }`}
              style={{ backgroundColor: colorOption }}
              aria-label={`Select color ${colorOption}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
