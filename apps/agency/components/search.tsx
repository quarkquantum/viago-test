'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@repo/design-system/web/src/components/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/design-system/web/src/components/ui/input-group';
import { ChevronDown, RefreshCcw, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type SearchProps = {
  placeholder: string;
  value: string;
  filter?: {
    label: string;
    value: string;
    options: { label: string; value: string | undefined }[];
    selected?: string;
    type: string;
  }[];
  setFilter?: (newFilter: { [key: string]: string | undefined }) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
};

export const SearchInput = ({ placeholder, value, filter, setFilter, onChange, onRefresh }: SearchProps) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput onChange={onChange} placeholder={placeholder} value={value} />{' '}
      <InputGroupAddon align="inline-start">
        {filter ? (
          <DropdownMenu onOpenChange={setOpen} open={open}>
            <DropdownMenuTrigger asChild>
              <InputGroupButton aria-label={t('more')} size="xs" variant="ghost">
                {t('searchBy')}
                <ChevronDown className={`duration-300 ease-in-out ${open ? '' : '-rotate-90'}`} />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="">
              {filter?.map((item) => (
                <DropdownMenuSub key={item.value}>
                  <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        className="w-48"
                        onValueChange={(value) => {
                          setFilter?.({ [item.value]: value });
                        }}
                        value={item.selected || ''}
                      >
                        {item.options.map((option) => (
                          <DropdownMenuRadioItem key={option.label} value={option.value as string}>
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Search />
        )}
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Button
          className="text-muted-foreground duration-300 ease-in-out active:rotate-180"
          onClick={onRefresh}
          size={'icon-sm'}
          variant={'link'}
        >
          <RefreshCcw />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};
