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
  setFilterAction?: (newFilter: { [key: string]: string | undefined }) => void;
  onChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefreshAction: () => void;
};

export const SearchInput = ({
  placeholder,
  value,
  filter,
  setFilterAction,
  onChangeAction,
  onRefreshAction,
}: SearchProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');
  return (
    <InputGroup>
      <InputGroupInput onChange={onChangeAction} placeholder={placeholder} value={value} />{' '}
      <InputGroupAddon align="inline-start">
        {filter ? (
          <DropdownMenu onOpenChange={setOpen} open={open}>
            <DropdownMenuTrigger asChild>
              <InputGroupButton aria-label="More" size="xs" variant="ghost">
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
                          setFilterAction?.({ [item.value]: value });
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
          onClick={onRefreshAction}
          size={'icon-sm'}
          variant={'link'}
        >
          <RefreshCcw />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};
