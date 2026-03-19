'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Settings2, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getAnalyticsConfig } from '@/api/apps';
import type { AnalyticsConfig, AppConfig } from '@/api/apps/types';
import EventDictionaryCard from '@/components/system/event-dictionary-card';
import PageContainer from '@/components/layout/page-container';
import { FormInput } from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActiveProject } from '@/lib/hooks/use-active-project';
import { useApps } from '@/lib/hooks/use-apps';
import { useAnalyticsConfig, useSaveAnalyticsConfig } from '@/lib/hooks/use-analytics-config';
import { useCreateApp, useDeleteApp, useUpdateApp } from '@/lib/hooks/use-app-mutations';
import { AnalyticsConfigSchema, AppConfigFormSchema } from '@/lib/schemas/app';
import type { AnalyticsConfigFormValues, AnalyticsConfigValues, AppConfigFormValues } from '@/lib/types/app';

const DEFAULT_ANALYTICS: AnalyticsConfigValues = {
  events: { level_start: '', level_win: '', level_fail: '' },
  boosters: []
};

const normalizeAnalyticsConfig = (config: AnalyticsConfig | null): AnalyticsConfigFormValues => {
  if (!config) {
    return DEFAULT_ANALYTICS;
  }
  const boosters = (config.boosters ?? []).map((b) => {
    const rawCost = typeof b.coin_cost === 'number' ? b.coin_cost : Number(b.coin_cost);
    const coinCost = Number.isFinite(rawCost) ? rawCost : 0;
    return {
      event_name: b.event_name ?? '',
      display_name: b.display_name ?? '',
      coin_cost: coinCost
    };
  });
  return {
    events: {
      level_start: config.events?.level_start ?? '',
      level_win: config.events?.level_win ?? '',
      level_fail: config.events?.level_fail ?? ''
    },
    boosters
  };
};

const mapAppToFormValues = (app: AppConfig): AppConfigFormValues => {
  return {
    name: app.name,
    appId: app.app_id ?? '',
    apiToken: app.api_token ?? '',
    scheduleTime: app.schedule_time ?? '12:00',
    intervalMinutes: app.interval_minutes ?? 60,
    isActive: app.is_active
  };
};

const mapFormValuesToAppBody = (values: AppConfigFormValues): Omit<AppConfig, 'id'> => {
  return {
    name: values.name,
    app_id: values.appId,
    api_token: values.apiToken,
    schedule_time: values.scheduleTime,
    interval_minutes: values.intervalMinutes,
    is_active: values.isActive
  };
};

export default function SettingsPage() {
  const { apps, activeApp, setActiveApp } = useActiveProject();
  const appsQuery = useApps();

  const createAppMutation = useCreateApp();
  const updateAppMutation = useUpdateApp();
  const deleteAppMutation = useDeleteApp();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);

  const analyticsQuery = useAnalyticsConfig(activeApp?.id ?? null);
  const saveAnalyticsMutation = useSaveAnalyticsConfig();

  const appForm = useForm<AppConfigFormValues>({
    resolver: zodResolver(AppConfigFormSchema),
    defaultValues: {
      name: '',
      appId: '',
      apiToken: '',
      scheduleTime: '12:00',
      intervalMinutes: 60,
      isActive: true
    }
  });

  const analyticsForm = useForm<AnalyticsConfigFormValues>({
    resolver: zodResolver(AnalyticsConfigSchema),
    defaultValues: DEFAULT_ANALYTICS
  });

  useEffect(() => {
    if (isAdding) {
      appForm.reset({
        name: '',
        appId: '',
        apiToken: '',
        scheduleTime: '00:00',
        intervalMinutes: 60,
        isActive: true
      });
      return;
    }
    if (activeApp) {
      appForm.reset(mapAppToFormValues(activeApp));
    }
  }, [activeApp, appForm, isAdding]);

  useEffect(() => {
    analyticsForm.reset(normalizeAnalyticsConfig(analyticsQuery.data ?? null));
  }, [analyticsForm, analyticsQuery.data]);

  const previewData = analyticsQuery.data;

  const isBusy =
    createAppMutation.isPending ||
    updateAppMutation.isPending ||
    deleteAppMutation.isPending ||
    saveAnalyticsMutation.isPending;

  const activeAppId = activeApp?.id ?? null;

  const executeSelectApp = (appId: number): void => {
    setIsAdding(false);
    setActiveApp(appId);
  };

  const executeAddNew = (): void => {
    setIsAdding(true);
  };

  const executeSubmitApp = async (values: AppConfigFormValues): Promise<void> => {
    const body = mapFormValuesToAppBody(values);
    try {
      if (isAdding) {
        const created = await createAppMutation.mutateAsync(body);
        toast.success('Created new app');
        setIsAdding(false);
        setActiveApp(created.id);
        return;
      }
      if (!activeAppId) {
        toast.error('No app selected');
        return;
      }
      await updateAppMutation.mutateAsync({ appId: activeAppId, body });
      toast.success('Saved changes');
    } catch {
      toast.error('Failed to save app configuration');
    }
  };

  const executeDeleteApp = async (app: AppConfig): Promise<void> => {
    if (!confirm(`Delete ${app.name}?`)) {
      return;
    }
    try {
      await deleteAppMutation.mutateAsync(app.id);
      toast.success('Deleted app');
      if (activeAppId === app.id) {
        const next = apps.find((a) => a.id !== app.id) ?? null;
        if (next) {
          setActiveApp(next.id);
        }
      }
    } catch {
      toast.error('Failed to delete app');
    }
  };

  const executeOpenAnalytics = async (): Promise<void> => {
    if (!activeAppId) {
      return;
    }
    try {
      const config = await getAnalyticsConfig(activeAppId);
      analyticsForm.reset(AnalyticsConfigSchema.parse(config ?? DEFAULT_ANALYTICS));
      setIsAnalyticsOpen(true);
    } catch {
      analyticsForm.reset(DEFAULT_ANALYTICS);
      setIsAnalyticsOpen(true);
    }
  };

  const executeSaveAnalytics = async (): Promise<void> => {
    if (!activeAppId) {
      return;
    }
    const values = analyticsForm.getValues();
    try {
      const sanitized = {
        events: {
          level_start: values.events?.level_start ?? '',
          level_win: values.events?.level_win ?? '',
          level_fail: values.events?.level_fail ?? ''
        },
        boosters: (values.boosters ?? []).map((b) => ({
          event_name: b.event_name ?? '',
          display_name: b.display_name ?? '',
          coin_cost:
            typeof b.coin_cost === 'number' ? b.coin_cost : Number(b.coin_cost ?? 0)
        }))
      };
      const parsedResult = AnalyticsConfigSchema.safeParse(sanitized);
      if (!parsedResult.success) {
        const firstIssue = parsedResult.error.issues[0];
        toast.error(firstIssue?.message ?? 'Invalid analytics configuration');
        return;
      }
      const parsed = parsedResult.data;
      const body: AnalyticsConfig = {
        events: parsed.events,
        boosters: parsed.boosters.map((b) => ({
          event_name: b.event_name,
          display_name: b.display_name ?? '',
          coin_cost: b.coin_cost
        }))
      };
      await saveAnalyticsMutation.mutateAsync({ appId: activeAppId, body });
      toast.success('Saved analytics configuration');
      setIsAnalyticsOpen(false);
    } catch {
      toast.error('Failed to save analytics configuration');
    }
  };

  const boosterFields = analyticsForm.watch('boosters');

  const hasPreview =
    Boolean(previewData?.events?.level_start) ||
    Boolean(previewData?.events?.level_win) ||
    Boolean(previewData?.events?.level_fail) ||
    Boolean(previewData?.boosters?.length);

  const shouldShowAnalyticsPreview = !isAdding && Boolean(activeAppId) && hasPreview;

  const selectedAppName = activeApp?.name ?? '';

  const shouldShowLoading = appsQuery.isLoading;

  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='Manage game configs, analytics mapping, and event dictionary'
      isloading={shouldShowLoading}
    >
      <div className='flex flex-1 flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Games</CardTitle>
          </CardHeader>
          <CardContent>
            {apps.length === 0 && (
              <div className='text-muted-foreground mb-3 text-sm'>
                No games yet. Create your first game configuration to get started.
              </div>
            )}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              {apps.map((app) => {
                const isSelected = !isAdding && activeAppId === app.id;
                return (
                  <div
                    key={app.id}
                    role='button'
                    tabIndex={0}
                    onClick={() => executeSelectApp(app.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        executeSelectApp(app.id);
                      }
                    }}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className='min-w-0 pr-2'>
                      <div className='truncate font-semibold' title={app.name}>
                        {app.name}
                      </div>
                      <div className='text-muted-foreground truncate font-mono text-xs'>
                        ID: {app.id}
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        void executeDeleteApp(app);
                      }}
                      className='opacity-0 transition-opacity group-hover:opacity-100'
                      title='Delete'
                      disabled={isBusy}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                );
              })}
              <button
                type='button'
                onClick={executeAddNew}
                className={`text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed p-4 font-medium transition-colors hover:bg-muted/50 ${
                  isAdding ? 'border-primary bg-primary/5 text-primary' : ''
                }`}
              >
                <Plus className='size-4' />
                Add new game
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings2 className='size-5' />
              {isAdding ? 'Create new game config' : `Configuration: ${selectedAppName}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              form={appForm}
              onSubmit={appForm.handleSubmit(executeSubmitApp)}
              className='grid gap-4 md:grid-cols-2'
            >
              <FormInput
                control={appForm.control}
                name='name'
                label='Game Name'
                required
              />
              <FormInput
                control={appForm.control}
                name='appId'
                label='AppMetrica App ID'
                required
              />
              <FormInput
                control={appForm.control}
                name='apiToken'
                label='OAuth Token'
                type='password'
                required
                className='md:col-span-2'
              />
              <div className='space-y-2'>
                <Label>Schedule Time</Label>
                <Input
                  type='time'
                  value={appForm.watch('scheduleTime')}
                  onChange={(e) => appForm.setValue('scheduleTime', e.target.value, { shouldDirty: true })}
                />
              </div>
              <FormInput
                control={appForm.control}
                name='intervalMinutes'
                label='Interval (Min)'
                type='number'
                min={1}
                step={1}
                required
              />
              <div className='flex items-center gap-2 md:col-span-2'>
                <input
                  type='checkbox'
                  checked={appForm.watch('isActive')}
                  onChange={(e) => appForm.setValue('isActive', e.target.checked, { shouldDirty: true })}
                  className='size-4'
                />
                <Label>Automatic Schedule</Label>
              </div>

              {shouldShowAnalyticsPreview && (
                <div className='md:col-span-2'>
                  <div className='bg-muted/30 rounded-lg border p-4'>
                    <div className='text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide'>
                      Analytics map preview
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <div className='text-muted-foreground text-xs font-semibold uppercase'>
                          Level events
                        </div>
                        <div className='space-y-1 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground text-xs'>Start</span>
                            <code className='bg-background rounded border px-2 py-0.5 font-mono text-xs'>
                              {previewData?.events?.level_start || '-'}
                            </code>
                          </div>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground text-xs'>Win</span>
                            <code className='bg-background rounded border px-2 py-0.5 font-mono text-xs'>
                              {previewData?.events?.level_win || '-'}
                            </code>
                          </div>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground text-xs'>Fail</span>
                            <code className='bg-background rounded border px-2 py-0.5 font-mono text-xs'>
                              {previewData?.events?.level_fail || '-'}
                            </code>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='text-muted-foreground text-xs font-semibold uppercase'>
                          Boosters ({previewData?.boosters?.length ?? 0})
                        </div>
                        <div className='bg-background max-h-32 overflow-auto rounded border'>
                          <div className='divide-y'>
                            {(previewData?.boosters ?? []).length === 0 ? (
                              <div className='text-muted-foreground p-3 text-xs'>
                                No boosters mapped yet.
                              </div>
                            ) : (
                              (previewData?.boosters ?? []).map((b, idx) => (
                                <div
                                  key={`${b.event_name ?? 'evt'}-${b.display_name ?? 'disp'}-${b.coin_cost ?? 0}-${idx}`}
                                  className='flex items-center justify-between gap-3 p-2 text-xs'
                                >
                                  <span className='truncate font-mono text-muted-foreground'>
                                    {b.event_name}
                                  </span>
                                  <span className='truncate'>{b.display_name || '-'}</span>
                                  <span className='tabular-nums font-mono'>
                                    {b.coin_cost}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex items-center justify-end gap-2 md:col-span-2'>
                {!isAdding && activeAppId && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => void executeOpenAnalytics()}
                    disabled={isBusy}
                  >
                    Advanced analytics
                  </Button>
                )}
                <Button type='submit' disabled={isBusy}>
                  <Save className='mr-2 size-4' />
                  {isAdding ? 'Create game' : 'Save changes'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        {!isAdding && activeAppId && <EventDictionaryCard appId={activeAppId} />}

        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
          <DialogContent className='sm:max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Event mapping: {selectedAppName}</DialogTitle>
            </DialogHeader>
            <div className='grid gap-6'>
              <div className='bg-muted/30 rounded-lg border p-4'>
                <div className='mb-4 text-sm font-semibold'>Level events</div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label>Start level event</Label>
                    <Input
                      value={analyticsForm.watch('events.level_start')}
                      onChange={(e) =>
                        analyticsForm.setValue('events.level_start', e.target.value, { shouldDirty: true })
                      }
                      placeholder='e.g. level_start'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Win level event</Label>
                    <Input
                      value={analyticsForm.watch('events.level_win')}
                      onChange={(e) =>
                        analyticsForm.setValue('events.level_win', e.target.value, { shouldDirty: true })
                      }
                      placeholder='e.g. mission_completed'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Fail level event</Label>
                    <Input
                      value={analyticsForm.watch('events.level_fail')}
                      onChange={(e) =>
                        analyticsForm.setValue('events.level_fail', e.target.value, { shouldDirty: true })
                      }
                      placeholder='e.g. mission_failed'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-semibold'>Boosters & economy</div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      analyticsForm.setValue(
                        'boosters',
                        [...(boosterFields ?? []), { event_name: '', display_name: '', coin_cost: 0 }],
                        { shouldDirty: true }
                      );
                    }}
                  >
                    <Plus className='mr-2 size-4' />
                    Add booster
                  </Button>
                </div>
                <div className='rounded-lg border'>
                  <div className='bg-muted/40 grid grid-cols-12 gap-2 border-b px-3 py-2 text-xs font-semibold'>
                    <div className='col-span-4'>Event name</div>
                    <div className='col-span-4'>Display name</div>
                    <div className='col-span-3 text-right'>Cost</div>
                    <div className='col-span-1' />
                  </div>
                  <div className='divide-y'>
                    {(boosterFields ?? []).length === 0 ? (
                      <div className='text-muted-foreground p-4 text-sm'>
                        No boosters configured. Click “Add booster” to start.
                      </div>
                    ) : (
                      (boosterFields ?? []).map((b, idx) => (
                        <div key={idx} className='grid grid-cols-12 gap-2 px-3 py-2'>
                          <div className='col-span-4'>
                            <Input
                              value={b.event_name}
                              onChange={(e) => {
                                const next = [...(boosterFields ?? [])];
                                next[idx] = { ...next[idx], event_name: e.target.value };
                                analyticsForm.setValue('boosters', next, { shouldDirty: true });
                              }}
                              placeholder='e.g. use_hammer'
                            />
                          </div>
                          <div className='col-span-4'>
                            <Input
                              value={b.display_name ?? ''}
                              onChange={(e) => {
                                const next = [...(boosterFields ?? [])];
                                next[idx] = { ...next[idx], display_name: e.target.value };
                                analyticsForm.setValue('boosters', next, { shouldDirty: true });
                              }}
                              placeholder='e.g. Hammer'
                            />
                          </div>
                          <div className='col-span-3'>
                            <Input
                              type='number'
                              value={
                                typeof b.coin_cost === 'number'
                                  ? b.coin_cost
                                  : Number(b.coin_cost ?? 0)
                              }
                              onChange={(e) => {
                                const next = [...(boosterFields ?? [])];
                                next[idx] = { ...next[idx], coin_cost: Number(e.target.value) };
                                analyticsForm.setValue('boosters', next, { shouldDirty: true });
                              }}
                              className='text-right'
                              min={0}
                              step={1}
                            />
                          </div>
                          <div className='col-span-1 flex items-center justify-end'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                const next = [...(boosterFields ?? [])];
                                next.splice(idx, 1);
                                analyticsForm.setValue('boosters', next, { shouldDirty: true });
                              }}
                              title='Remove'
                            >
                              <Trash2 className='size-4' />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsAnalyticsOpen(false)}
                disabled={saveAnalyticsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={() => void executeSaveAnalytics()}
                disabled={saveAnalyticsMutation.isPending}
              >
                <Save className='mr-2 size-4' />
                {saveAnalyticsMutation.isPending ? 'Saving...' : 'Save configuration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

