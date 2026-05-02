import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import { useGetUser } from '@/features/users/api/use-get-user';
import { UpdateUserForm } from './update-user-form';

export const UpdateUser = ({ id, label }: { id: string; label?: string }) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetUser(id);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          <Edit className="size-4" />
          {label ?? 'Update Details'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>Update user personal information</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">Loading...</div>
        ) : data?.data ? (
          <UpdateUserForm id={id} setOpen={setOpen} user={data.data} />
        ) : (
          <div>User not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
