'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/web/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/web/src/components/ui/popover';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  withSearch?: boolean;
  onSearchChange?: (search: string) => void;
};

export const Select = ({
  options,
  value: controlledValue,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No option found.',
  disabled = false,
  withSearch = true,
  onSearchChange,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="w-full max-w-full justify-between truncate border font-normal text-sm"
          disabled={disabled}
          variant={'secondary'}
        >
          <span className="truncate">
            {value ? options.find((option) => option.value === value)?.label : placeholder}
          </span>
          <ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-fit w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={!onSearchChange}>
          {withSearch && (
            <CommandInput className="h-9" onValueChange={onSearchChange} placeholder={searchPlaceholder} />
          )}
          <CommandList className="h-fit max-h-48 overflow-y-auto">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  value={option.value}
                >
                  <div className="w-full truncate text-sm">{option.label}</div>
                  <Check className={cn('ml-auto', value === option.value ? 'opacity-100' : 'hidden opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
