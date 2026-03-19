'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';

interface MonitorTableParams<TData, TValue> {
  readonly data: TData[];
  readonly totalItems: number;
  readonly columns: ColumnDef<TData, TValue>[];
  readonly toolbarChildren?: React.ReactNode;
}

export function MonitorTable<TData, TValue>({
  data,
  totalItems,
  columns,
  toolbarChildren
}: MonitorTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(30));
  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>{toolbarChildren}</DataTableToolbar>
    </DataTable>
  );
}

