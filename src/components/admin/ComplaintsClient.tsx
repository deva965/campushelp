'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/lib/types';
import { complaintCategories, complaintStatuses } from '@/lib/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Check, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { cn } from '@/lib/utils';

export function ComplaintsClient() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Set<ComplaintCategory>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<ComplaintStatus>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredData = complaints.filter(complaint => {
    const searchMatch = globalFilter ? complaint.title.toLowerCase().includes(globalFilter.toLowerCase()) || complaint.studentDisplayName.toLowerCase().includes(globalFilter.toLowerCase()) : true;
    const categoryMatch = categoryFilter.size > 0 ? categoryFilter.has(complaint.category) : true;
    const statusMatch = statusFilter.size > 0 ? statusFilter.has(complaint.status) : true;
    return searchMatch && categoryMatch && statusMatch;
  });

  if (loading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  return (
    <DataTable columns={columns} data={filteredData}>
      <Input
        placeholder="Filter by title or student..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="max-w-sm"
      />
      <FilterPopover title="Category" options={complaintCategories} selected={categoryFilter} setSelected={setCategoryFilter} />
      <FilterPopover title="Status" options={complaintStatuses} selected={statusFilter} setSelected={setStatusFilter} />
    </DataTable>
  );
}

interface FilterPopoverProps<T extends string> {
    title: string;
    options: readonly T[];
    selected: Set<T>;
    setSelected: React.Dispatch<React.SetStateAction<Set<T>>>;
}

function FilterPopover<T extends string>({ title, options, selected, setSelected }: FilterPopoverProps<T>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {title}
                    {selected.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {selected.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selected.size > 2 ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selected.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selected.has(option))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.has(option);
                                return (
                                    <CommandItem
                                        key={option}
                                        onSelect={() => {
                                            const newSelected = new Set(selected);
                                            if (isSelected) {
                                                newSelected.delete(option);
                                            } else {
                                                newSelected.add(option);
                                            }
                                            setSelected(newSelected);
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{option}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selected.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => setSelected(new Set())}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
