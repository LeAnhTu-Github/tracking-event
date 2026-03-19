'use client';

import { Clock, RefreshCw } from 'lucide-react';
import type * as React from 'react';

import type { MonitorJob } from '@/api/monitor/types';
import { Badge } from '@/components/ui/badge';
import { TIME } from '@/lib/constants';

const VIETNAM_TIMEZONE_OFFSET_HOURS = 7;

function parseSafeDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  const parts = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{0,2}):?(\d{0,2}):?(\d{0,2})/
  );
  if (!parts) {
    return null;
  }
  const day = Number.parseInt(parts[1] ?? '', 10);
  const month = Number.parseInt(parts[2] ?? '', 10);
  const year = Number.parseInt(parts[3] ?? '', 10);
  const hour = Number.parseInt(parts[4] ?? '0', 10);
  const minute = Number.parseInt(parts[5] ?? '0', 10);
  const second = Number.parseInt(parts[6] ?? '0', 10);
  const fallback = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatRawTime(value: string | null | undefined): string {
  const date = parseSafeDate(value);
  if (!date) {
    return value ? String(value) : '-';
  }
  return date.toLocaleString('en-GB', { hour12: false });
}

export function getIsRunningState(status: string | null | undefined): boolean {
  const normalized = (status ?? '').toLowerCase();
  return normalized === 'running' || normalized === 'processing';
}

export function calculateDuration(
  startTime: string | null | undefined,
  endTime: string | null | undefined
): string {
  const startDate = parseSafeDate(startTime);
  if (!startDate) {
    return '-';
  }
  const endDate = parseSafeDate(endTime);
  const endMs = endDate ? endDate.getTime() : endTime ? null : Date.now();
  if (!endMs) {
    return '-';
  }
  const diffMs = endMs - startDate.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return '0s';
  }
  const hours = Math.floor(diffMs / TIME.HOUR);
  const minutes = Math.floor((diffMs % TIME.HOUR) / TIME.MINUTE);
  const seconds = Math.floor((diffMs % TIME.MINUTE) / TIME.SECOND);
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function formatDataRange(
  since: string | null | undefined,
  until: string | null | undefined
): React.ReactNode {
  if (!since || !until) {
    return <span className='text-muted-foreground italic'>-</span>;
  }
  const sinceDate = parseSafeDate(since);
  const untilDate = parseSafeDate(until);
  if (!sinceDate || !untilDate) {
    return <span className='text-muted-foreground italic'>-</span>;
  }
  const sinceVn = new Date(
    sinceDate.getTime() + VIETNAM_TIMEZONE_OFFSET_HOURS * TIME.HOUR
  );
  const untilVn = new Date(
    untilDate.getTime() + VIETNAM_TIMEZONE_OFFSET_HOURS * TIME.HOUR
  );
  const dateStr = sinceVn.toISOString().split('T')[0] ?? '-';
  const vnTime = `${sinceVn.toISOString().slice(11, 16)} - ${untilVn
    .toISOString()
    .slice(11, 16)}`;
  const utcTime = `${sinceDate.toISOString().slice(11, 16)} - ${untilDate
    .toISOString()
    .slice(11, 16)}`;
  return (
    <div className='flex flex-col gap-0.5 text-[11px]'>
      <div className='font-semibold text-primary tabular-nums'>{dateStr}</div>
      <div className='text-muted-foreground tabular-nums'>
        <span className='font-medium text-foreground'>VN[{vnTime}]</span>{' '}
        <span className='text-muted-foreground/70 text-[10px]'>(UTC: {utcTime})</span>
      </div>
    </div>
  );
}

export function renderStartTimeCell(job: MonitorJob): React.ReactNode {
  if (job.start_time) {
    return formatRawTime(job.start_time);
  }
  if (job.scheduled_at) {
    return (
      <span className='inline-flex items-center gap-1 font-medium text-amber-700'>
        <Clock className='size-3' />
        {formatRawTime(job.scheduled_at)}
      </span>
    );
  }
  return <span className='text-muted-foreground italic text-xs'>Pending...</span>;
}

export function renderStatusBadge(
  status: string | null | undefined
): React.ReactNode {
  const normalized = (status ?? '').toLowerCase();
  if (!status) {
    return <Badge variant='outline'>-</Badge>;
  }
  if (normalized === 'success') {
    return (
      <Badge className='bg-emerald-100 text-emerald-800 border-emerald-200'>
        Success
      </Badge>
    );
  }
  if (getIsRunningState(status)) {
    return (
      <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
        <RefreshCw className='animate-spin' />
        {status}
      </Badge>
    );
  }
  if (normalized === 'cancelled') {
    return (
      <Badge className='bg-slate-100 text-slate-700 border-slate-200'>
        Cancelled
      </Badge>
    );
  }
  if (normalized === 'failed') {
    return <Badge variant='destructive'>Failed</Badge>;
  }
  return <Badge variant='secondary'>{status}</Badge>;
}

export function toLocalDateTimeInputValue(date: Date): string {
  const adjusted = new Date(
    date.getTime() - date.getTimezoneOffset() * TIME.MINUTE
  );
  return adjusted.toISOString().slice(0, 16);
}

