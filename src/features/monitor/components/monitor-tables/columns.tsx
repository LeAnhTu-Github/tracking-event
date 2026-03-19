'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { MonitorJob } from '@/api/monitor/types';
import MonitorHistoryCellAction from './cell-action';
import { MONITOR_RETRYABLE_STATUSES } from './options';
import {
  calculateDuration,
  formatDataRange,
  formatRawTime,
  renderStartTimeCell,
  renderStatusBadge
} from '@/features/monitor/components/monitor-tables/formatters';

export interface MonitorHistoryColumnsParams {
  readonly getExportUrl: (jobId: number) => string | null;
  readonly isRetryDisabled: boolean;
  readonly isStopDisabled: boolean;
  readonly isDeleteDisabled: boolean;
  readonly onRetry: (jobId: number) => void;
  readonly onStop: (jobId: number) => void;
  readonly onViewLogs: (job: MonitorJob) => void;
  readonly onDelete: (jobId: number) => void;
}

export function getMonitorHistoryColumns(
  params: MonitorHistoryColumnsParams
): ColumnDef<MonitorJob>[] {
  const {
    getExportUrl,
    isRetryDisabled,
    isStopDisabled,
    isDeleteDisabled,
    onRetry,
    onStop,
    onViewLogs,
    onDelete
  } = params;

  return [
    {
      id: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className='font-mono text-xs'>#{row.original.id}</span>
      )
    },
    {
      id: 'run_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className='text-xs font-medium uppercase'>
          {row.original.run_type ?? '-'}
        </span>
      )
    },
    {
      id: 'data_range',
      header: 'Data Range',
      cell: ({ row }) =>
        formatDataRange(row.original.date_since, row.original.date_until)
    },
    {
      id: 'start_time',
      header: 'Start',
      cell: ({ row }) => (
        <span className='font-mono text-xs text-muted-foreground'>
          {renderStartTimeCell(row.original)}
        </span>
      )
    },
    {
      id: 'end_time',
      header: 'End',
      cell: ({ row }) => (
        <span className='font-mono text-xs text-muted-foreground'>
          {row.original.end_time ? (
            formatRawTime(row.original.end_time)
          ) : (
            <span className='text-primary italic'>Running...</span>
          )}
        </span>
      )
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <span className='font-mono text-xs'>
          {calculateDuration(row.original.start_time, row.original.end_time)}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className='text-xs'>
          {renderStatusBadge(row.original.status ?? null)}
        </span>
      )
    },
    {
      id: 'total_events',
      header: () => <div className='text-right'>Events</div>,
      cell: ({ row }) => (
        <div className='text-right font-mono text-xs'>
          {(row.original.total_events ?? 0).toLocaleString()}
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => {
        const job = row.original;
        const normalizedStatus = (job.status ?? '').toLowerCase();
        const canRetry = MONITOR_RETRYABLE_STATUSES.has(normalizedStatus);
        const exportUrl = job.date_since ? getExportUrl(job.id) : null;

        return (
          <MonitorHistoryCellAction
            job={job}
            exportUrl={exportUrl}
            isRetryDisabled={isRetryDisabled}
            isStopDisabled={isStopDisabled}
            isDeleteDisabled={isDeleteDisabled}
            canRetry={canRetry}
            onRetry={onRetry}
            onStop={onStop}
            onViewLogs={onViewLogs}
            onDelete={onDelete}
          />
        );
      }
    }
  ];
}

