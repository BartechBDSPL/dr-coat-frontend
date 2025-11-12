'use client';
import React, { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  loading?: boolean;
  allowCustomValue?: boolean;
  onCustomValueChange?: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value = '',
  onValueChange,
  onCustomValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options available',
  disabled = false,
  loading = false,
  allowCustomValue = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedLabel =
    safeOptions.find(option => option.value === value)?.label ||
    value ||
    placeholder;

  // Modified filtering logic to be case-insensitive and more permissive
  const filteredOptions = safeOptions.filter(
    option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // New function to check if the search query matches any existing option
  const isExactMatch = useCallback(() => {
    return safeOptions.some(
      option =>
        option.label.toLowerCase() === searchQuery.toLowerCase() ||
        option.value.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [safeOptions, searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      allowCustomValue &&
      searchQuery &&
      filteredOptions.length === 0
    ) {
      e.preventDefault();
      onValueChange(searchQuery);
      if (onCustomValueChange) {
        onCustomValueChange(searchQuery);
      }
      setSearchQuery('');
      setOpen(false);
    }
  };

  const handleAddCustomValue = () => {
    if (searchQuery) {
      onValueChange(searchQuery);
      if (onCustomValueChange) {
        onCustomValueChange(searchQuery);
      }
      setSearchQuery('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <span className="truncate">{selectedLabel}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
          />
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {allowCustomValue && searchQuery && !isExactMatch() && (
              <CommandItem
                onSelect={handleAddCustomValue}
                className="flex cursor-pointer items-center px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add &quot;{searchQuery}&quot;
              </CommandItem>
            )}

            {/* Show filtered options */}
            {filteredOptions.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onValueChange(option.value);
                  setSearchQuery('');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === option.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {options.length === 0 && (
            <CommandEmpty>
              {searchQuery ? 'No records found' : emptyText}
            </CommandEmpty>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CustomDropdown;
