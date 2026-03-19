'use client';

import {
  Play,
  RefreshCw,
  RotateCcw,
  StopCircle,
  Trash2,
  X
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';

import { getExportUrl } from '@/api/monitor';
import type { ManualJobBody, MonitorJob } from '@/api/monitor/types';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { API_URL, MONITOR_DEFAULTS, TIME } from '@/lib/constants';
import { useActiveProject } from '@/lib/hooks/use-active-project';
import useMonitorPage from '@/lib/hooks/use-monitor-page';
import { MonitorTable } from '@/features/monitor/components/monitor-tables';
import { getMonitorHistoryColumns } from '@/features/monitor/components/monitor-tables/columns';
import {
  formatRawTime,
  getIsRunningState,
  toLocalDateTimeInputValue
} from '@/features/monitor/components/monitor-tables/formatters';

const getAbsoluteExportUrl = (jobId: number): string | null => {
  if (!API_URL) {
    return null;
  }
  try {
    return new URL(getExportUrl(jobId), API_URL).toString();
  } catch {
    return null;
  }
};

const normalizeManualJobAppId = (value: string): string => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? '' : String(parsed);
};

export default function MonitorPage() {
  const { activeApp, apps } = useActiveProject();

  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('perPage', parseAsInteger.withDefault(MONITOR_DEFAULTS.HISTORY_PAGE_SIZE));
  const [startDate, setStartDate] = useQueryState('startDate', parseAsString.withDefault(''));
  const [endDate, setEndDate] = useQueryState('endDate', parseAsString.withDefault(''));

  const [selectedJob, setSelectedJob] = useState<MonitorJob | null>(null);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [manualBody, setManualBody] = useState<ManualJobBody>({
    app_id: '',
    start_time: '',
    end_time: '',
    execution_time: null
  });

  const monitorPage = useMonitorPage({
    appId: activeApp?.id ?? null,
    page,
    limit,
    startDate,
    endDate
  });
  const jobs = monitorPage.jobs;

  const stats = useMemo(() => {
    const total = jobs.length;
    const running = jobs.filter((j) => getIsRunningState(j.status ?? null)).length;
    const failed = jobs.filter((j) => (j.status ?? '').toLowerCase() === 'failed').length;
    return { total, running, failed };
  }, [jobs]);

  const executeRefresh = async (): Promise<void> => {
    await monitorPage.monitorHistoryQuery.refetch();
  };

  const executeOpenManualJob = (): void => {
    const now = new Date();
    const endTime = toLocalDateTimeInputValue(now);
    const startTime = toLocalDateTimeInputValue(new Date(now.getTime() - TIME.HOUR));
    const defaultAppId = activeApp?.id ? String(activeApp.id) : apps[0]?.id ? String(apps[0].id) : '';
    setManualBody({
      app_id: normalizeManualJobAppId(defaultAppId),
      start_time: startTime,
      end_time: endTime,
      execution_time: null
    });
    setIsManualOpen(true);
  };

  const executeRunDemo = async (): Promise<void> => {
    if (!activeApp) {
      return;
    }
    try {
      await monitorPage.runJobMutation.mutateAsync({ appId: activeApp.id, runType: 'demo' });
      toast.success('Triggered demo job');
    } catch {
      toast.error('Failed to trigger demo job');
    }
  };

  const executeRetry = async (jobId: number): Promise<void> => {
    if (!activeApp) {
      return;
    }
    try {
      await monitorPage.runJobMutation.mutateAsync({
        appId: activeApp.id,
        runType: 'retry',
        retryJobId: jobId
      });
      toast.success(`Retry triggered for job #${jobId}`);
    } catch {
      toast.error('Failed to retry job');
    }
  };

  const executeStop = async (jobId: number): Promise<void> => {
    if (!confirm(`Stop Job #${jobId}?`)) {
      return;
    }
    try {
      await monitorPage.stopJobMutation.mutateAsync(jobId);
      toast.success(`Stop requested for job #${jobId}`);
    } catch {
      toast.error('Failed to stop job');
    }
  };

  const executePurge = async (): Promise<void> => {
    if (!activeApp) {
      return;
    }
    if (!confirm('Delete all history for this app?')) {
      return;
    }
    try {
      await monitorPage.purgeMutation.mutateAsync(activeApp.id);
      toast.success('Purged monitor history');
    } catch {
      toast.error('Failed to purge monitor history');
    }
  };

  const executeDeleteSingle = async (jobId: number): Promise<void> => {
    if (!confirm(`Delete record #${jobId}?`)) {
      return;
    }
    try {
      await monitorPage.deleteMutation.mutateAsync(jobId);
      toast.success(`Deleted job #${jobId}`);
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const executeClearFilters = (): void => {
    void setStartDate('');
    void setEndDate('');
  };

  const executeSubmitManualJob = async (): Promise<void> => {
    if (!manualBody.app_id || !manualBody.start_time || !manualBody.end_time) {
      toast.error('Please fill App, Start time, and End time');
      return;
    }
    try {
      const response = await monitorPage.createManualJobMutation.mutateAsync({
        ...manualBody,
        execution_time: manualBody.execution_time || null
      });
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('Manual job created');
      }
      setIsManualOpen(false);
    } catch {
      toast.error('Failed to create manual job');
    }
  };

  const handleViewLogs = useCallback((job: MonitorJob) => {
    setSelectedJob(job);
  }, []);

  const columns = useMemo(() => {
    return getMonitorHistoryColumns({
      getExportUrl: getAbsoluteExportUrl,
      isRetryDisabled: monitorPage.runJobMutation.isPending,
      isStopDisabled: monitorPage.stopJobMutation.isPending,
      isDeleteDisabled: monitorPage.deleteMutation.isPending,
      onRetry: (jobId) => {
        void executeRetry(jobId);
      },
      onStop: (jobId) => {
        void executeStop(jobId);
      },
      onViewLogs: handleViewLogs,
      onDelete: (jobId) => {
        void executeDeleteSingle(jobId);
      }
    });
  }, [
    handleViewLogs,
    monitorPage.deleteMutation.isPending,
    monitorPage.runJobMutation.isPending,
    monitorPage.stopJobMutation.isPending
  ]);

  return (
    <PageContainer
      pageTitle='Monitor'
      pageDescription='Track ETL jobs and monitor history'
      isloading={monitorPage.monitorHistoryQuery.isLoading}
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={executeRefresh} disabled={monitorPage.monitorHistoryQuery.isFetching}>
            <RefreshCw className={monitorPage.monitorHistoryQuery.isFetching ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />
            Refresh
          </Button>
          <Button onClick={executeRunDemo} disabled={!activeApp || monitorPage.runJobMutation.isPending}>
            <Play className='mr-2 size-4' />
            Test Demo
          </Button>
          <Button variant='outline' onClick={executeOpenManualJob} disabled={apps.length === 0}>
            <RotateCcw className='mr-2 size-4' />
            Create manual job
          </Button>
          <Button
            variant='destructive'
            onClick={executePurge}
            disabled={!activeApp || monitorPage.purgeMutation.isPending}
          >
            <Trash2 className='mr-2 size-4' />
            Delete All
          </Button>
        </div>
      }
    >
      {!activeApp ? (
        <Card>
          <CardContent className='text-muted-foreground py-8'>
            Select an active app/project to view monitor history.
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-1 flex-col gap-4'>
          
          <Card>
            <CardContent>
              <MonitorTable
                data={jobs as MonitorJob[]}
                totalItems={monitorPage.totalRecords}
                columns={columns}
                toolbarChildren={
                  <div className='flex items-center gap-2'>
                    <Input
                      type='date'
                      value={startDate}
                      onChange={(e) => {
                        void setStartDate(e.target.value);
                      }}
                      className='h-8 w-[160px]'
                    />
                    <span className='text-muted-foreground text-sm'>-</span>
                    <Input
                      type='date'
                      value={endDate}
                      onChange={(e) => {
                        void setEndDate(e.target.value);
                      }}
                      className='h-8 w-[160px]'
                    />
                    {(startDate || endDate) && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-9'
                        onClick={executeClearFilters}
                        title='Clear filters'
                      >
                        <X className='size-4' />
                      </Button>
                    )}
                  </div>
                }
              />
            </CardContent>
          </Card>
        </div>
      )}
      <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => (open ? null : setSelectedJob(null))}>
        <DialogContent className='sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Log Details {selectedJob ? `#${selectedJob.id}` : ''}</DialogTitle>
            <DialogDescription>
              {selectedJob?.start_time ? `Started: ${formatRawTime(selectedJob.start_time)}` : 'No start time recorded.'}
            </DialogDescription>
          </DialogHeader>
          <div className='bg-slate-950 text-emerald-300 font-mono text-xs whitespace-pre-wrap rounded-md p-4 max-h-[70vh] overflow-y-auto'>
            {selectedJob?.logs || 'No logs recorded.'}
          </div>
          <DialogFooter className='gap-2 sm:gap-2'>
            {selectedJob && getIsRunningState(selectedJob.status ?? null) && (
              <Button
                variant='destructive'
                onClick={async () => {
                  await executeStop(selectedJob.id);
                }}
              >
                <StopCircle className='mr-2 size-4' />
                Stop
              </Button>
            )}
            {selectedJob && (
              <Button
                variant='outline'
                onClick={async () => {
                  await executeRetry(selectedJob.id);
                }}
              >
                <RotateCcw className='mr-2 size-4' />
                Retry
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Create Manual Job</DialogTitle>
            <DialogDescription>
              Create a manual ETL job for a specific time window. Execution time is optional.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid gap-2'>
              <span className='text-sm font-medium'>Select app</span>
              <select
                className='border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
                value={manualBody.app_id}
                onChange={(e) => {
                  setManualBody((prev) => ({
                    ...prev,
                    app_id: normalizeManualJobAppId(e.target.value)
                  }));
                }}
              >
                {apps.map((app) => (
                  <option key={app.id} value={String(app.id)}>
                    {app.name} (ID: {app.id})
                  </option>
                ))}
              </select>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <span className='text-sm font-medium'>Start time</span>
                <Input
                  type='datetime-local'
                  value={manualBody.start_time}
                  onChange={(e) => {
                    setManualBody((prev) => ({
                      ...prev,
                      start_time: e.target.value
                    }));
                  }}
                />
              </div>
              <div className='grid gap-2'>
                <span className='text-sm font-medium'>End time</span>
                <Input
                  type='datetime-local'
                  value={manualBody.end_time}
                  onChange={(e) => {
                    setManualBody((prev) => ({
                      ...prev,
                      end_time: e.target.value
                    }));
                  }}
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <span className='text-sm font-medium'>Execution time (optional)</span>
              <Input
                type='datetime-local'
                value={manualBody.execution_time ?? ''}
                onChange={(e) => {
                  setManualBody((prev) => ({
                    ...prev,
                    execution_time: e.target.value || null
                  }));
                }}
              />
              <p className='text-muted-foreground text-xs'>
                Leave empty to execute ASAP. If set, the job will remain pending until this time.
              </p>
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-2'>
            <Button type='button' variant='outline' onClick={() => setIsManualOpen(false)}>
              Cancel
            </Button>
            <Button
              type='button'
              onClick={executeSubmitManualJob}
              disabled={monitorPage.createManualJobMutation.isPending}
            >
              <Play className='mr-2 size-4' />
              Create job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

