'use client';

import { Download, Eye, MoreVertical, RotateCcw, StopCircle, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { MonitorJob } from '@/api/monitor/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getIsRunningState } from './formatters';

export interface MonitorHistoryRowActionsParams {
  readonly job: MonitorJob;
  readonly exportUrl: string | null;
  readonly isRetryDisabled: boolean;
  readonly isStopDisabled: boolean;
  readonly isDeleteDisabled: boolean;
  readonly canRetry: boolean;
  readonly onRetry: (jobId: number) => void;
  readonly onStop: (jobId: number) => void;
  readonly onViewLogs: (job: MonitorJob) => void;
  readonly onDelete: (jobId: number) => void;
}

export default function MonitorHistoryCellAction(
  params: MonitorHistoryRowActionsParams
) {
  const {
    job,
    exportUrl,
    isRetryDisabled,
    isStopDisabled,
    isDeleteDisabled,
    canRetry,
    onRetry,
    onStop,
    onViewLogs,
    onDelete
  } = params;
  const isRunning = getIsRunningState(job.status ?? null);
  const isCancelled = (job.status ?? '').toLowerCase() === 'cancelled';

  return (
    <div className='flex justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-8'>
            <MoreVertical className='size-4' />
            <span className='sr-only'>Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {exportUrl && (
            <DropdownMenuItem
              onClick={() =>
                window.open(exportUrl, '_blank', 'noopener,noreferrer')
              }
            >
              <Download className='size-4' />
              Download
            </DropdownMenuItem>
          )}
          {canRetry && (
            <DropdownMenuItem
              onClick={() => onRetry(job.id)}
              disabled={isRetryDisabled}
            >
              <RotateCcw className='size-4' />
              {isCancelled ? 'Resume' : 'Retry'}
            </DropdownMenuItem>
          )}
          {isRunning && (
            <DropdownMenuItem
              onClick={() => onStop(job.id)}
              disabled={isStopDisabled}
              variant='destructive'
            >
              <StopCircle className='size-4' />
              Stop
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onViewLogs(job)}>
            <Eye className='size-4' />
            View logs
          </DropdownMenuItem>
          <DropdownMenuItem
            variant='destructive'
            onClick={() => onDelete(job.id)}
            disabled={isDeleteDisabled}
          >
            <Trash2 className='size-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

