'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Complaint } from '@/lib/types';
import { ComplaintStatusBadge } from '@/components/complaints/ComplaintStatusBadge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.length > 2 ? initials.substring(0, 2).toUpperCase() : initials.toUpperCase();
};

export const columns: ColumnDef<Complaint>[] = [
  {
    accessorKey: 'studentDisplayName',
    header: 'Student',
    cell: ({ row }) => {
        const complaint = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={complaint.studentPhotoUrl} />
                    <AvatarFallback>{getInitials(complaint.studentDisplayName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{complaint.studentDisplayName}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ComplaintStatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate();
      return date ? format(date, 'MMM d, yyyy') : 'N/A';
    },
  },
];
