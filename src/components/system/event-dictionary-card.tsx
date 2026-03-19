'use client';

import { useQuery } from '@tanstack/react-query';
import { Copy, RefreshCw } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { getEventDictionary } from '@/api/events';
import type { EventDictionaryResponse } from '@/api/events/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const getColorClassName = (group: string): string => {
  if (group.includes('Progression')) {
    return 'bg-blue-500/10 text-blue-600 ring-blue-500/20';
  }
  if (group.includes('Economy')) {
    return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20';
  }
  if (group.includes('Ads')) {
    return 'bg-amber-500/10 text-amber-600 ring-amber-500/20';
  }
  if (group.includes('System')) {
    return 'bg-muted text-muted-foreground ring-border';
  }
  return 'bg-purple-500/10 text-purple-600 ring-purple-500/20';
};

export default function EventDictionaryCard({ appId }: { appId: number }) {
  const query = useQuery({
    queryKey: ['event-dictionary', appId],
    queryFn: async (): Promise<EventDictionaryResponse> => {
      return await getEventDictionary(appId);
    },
    enabled: Boolean(appId)
  });

  const data = query.data;
  if (!data?.success) {
    return null;
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between gap-4'>
        <CardTitle className='flex items-center gap-2'>
          Event dictionary
          <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold'>
            {data.total_count.toLocaleString()}
          </span>
        </CardTitle>
        <Button
          variant='outline'
          size='sm'
          onClick={() => query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className={query.isFetching ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {Object.entries(data.groups).map(([groupName, events]) => (
            <div key={groupName} className='space-y-3'>
              <div className='text-muted-foreground flex items-center justify-between border-b pb-1 text-xs font-semibold uppercase tracking-wide'>
                <span>{groupName}</span>
                <span className='bg-muted rounded px-1.5 py-0.5 text-[10px]'>
                  {events.length}
                </span>
              </div>
              <div className='flex flex-wrap gap-2'>
                {events.map((evt) => (
                  <button
                    key={evt}
                    type='button'
                    onClick={async () => {
                      await navigator.clipboard.writeText(evt);
                      toast.success('Copied');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors hover:opacity-90 ${getColorClassName(
                      groupName
                    )}`}
                    title='Click to copy'
                  >
                    {evt}
                    <Copy className='size-3 opacity-70' />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

