'use client';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { NewDriverForm } from '@/components/driver/new-driver-form';

export const NewDriver = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add New Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>Fill in the details below to create a new driver.</DialogDescription>
        </DialogHeader>
        <NewDriverForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
