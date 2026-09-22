'use client';

import { useMutation } from '@tanstack/react-query';
import { clsx } from 'cn';
import { LogOutIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type UserStatus, updateUserStatus } from '../_actions/update-status';

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'VACATION', label: 'Férias' },
];

export function Menu() {
  const { data: session, update } = useSession();

  const status = session?.user?.status;
  const displayName = session?.user?.name?.split(' ').slice(0, 2).join(' ');
  const displayImage = session?.user?.image ?? undefined;
  const displayInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: async (result) => {
      if (result) await update({ status: result.status });

      toast.success('Status atualizado com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível atualizar o status');
    },
  });

  function handleStatusChange(value: string | null) {
    if (!value || value === status) return;

    changeStatus(value as UserStatus);
  }

  function handleSignOut() {
    toast.promise(signOut({ redirectTo: '/' }), {
      loading: 'Realizando logout...',
      success: 'Logout realizado com sucesso',
      error: 'Não foi possível realizar o logout',
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="cursor-pointer py-5 px-4">
            <Avatar>
              <AvatarImage src={displayImage} />
              <AvatarFallback>{displayInitials}</AvatarFallback>
              <AvatarBadge
                className={clsx({
                  'bg-green-500': status === 'ACTIVE',
                  'bg-red-500': status === 'INACTIVE',
                  'bg-yellow-500': status === 'VACATION',
                })}
              />
            </Avatar>
            <p className="hidden md:block text-sm text-muted-foreground">{displayName}</p>
          </Button>
        }
      />
      <DropdownMenuContent className="w-48" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <div className="px-2 pb-1.5">
            <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status">
                  {(value: string | null) =>
                    STATUS_OPTIONS.find((option) => option.value === value)?.label ??
                    'Selecione o status'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            className="cursor-pointer"
          >
            <LogOutIcon />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
