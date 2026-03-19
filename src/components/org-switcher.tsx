'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useActiveProject } from '@/lib/hooks/use-active-project';
import Image from 'next/image';

export function OrgSwitcher() {
  const { isMobile, state } = useSidebar();
  const { apps, activeApp, setActiveApp } = useActiveProject();
  const isLoading = false;
  const isError = false;
  const activeName = activeApp?.name ?? 'No Active Project';
  const activeIndex = apps.findIndex((app) => app.id === activeApp?.id);
  const activeIconSrc =
    activeIndex === 0
      ? '/assets/game-1.jpg'
      : activeIndex === 1
        ? '/assets/game-2.jpg'
        : '/assets/game-1.jpg';

  return (
    <SidebarMenu>
      {/* Row 1: Brand / Logo */}
      <SidebarMenuItem>
        <div className='flex items-center gap-2 px-2 py-1 text-blue-600 dark:text-blue-400'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='28'
            height='28'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-activity'
          >
            <path d='M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2' />
          </svg>
          <span className='text-xl font-bold tracking-tight'>Tracking Events</span>
        </div>
      </SidebarMenuItem>

      {/* Row 2: Active Project selector */}
      <SidebarMenuItem>
        <div
          className={`flex flex-col gap-1 px-2 transition-opacity duration-200 ${
            state === 'collapsed' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className='text-[11px] font-semibold uppercase text-muted-foreground'>
            Active Project
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className='flex items-center justify-between rounded-lg border bg-background px-2 py-1.5 text-left text-xs'>
                <div className='flex min-w-0 items-center gap-2'>
                  {!!activeApp && (
                    <div className='relative h-5 w-5 overflow-hidden rounded-md shrink-0'>
                      <Image
                        src={activeIconSrc}
                        alt={activeApp.name}
                        fill
                        sizes='20px'
                        className='object-cover'
                      />
                    </div>
                  )}
                  <span className='truncate'>
                    {isLoading ? 'Loading projects…' : activeName}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              align='start'
              side={'bottom'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-muted-foreground text-xs'>
                Active Project
              </DropdownMenuLabel>
              {apps.map((app, index) => {
                const iconSrc =
                  index === 0 ? '/assets/game-1.jpg' : index === 1 ? '/assets/game-2.jpg' : '/assets/game-1.jpg';
                return (
                  <DropdownMenuItem
                    key={app.id}
                    className='gap-2 p-2'
                    onClick={() => setActiveApp(app.id)}
                  >
                    <div className='flex items-center gap-2'>
                      <div className='relative h-7 w-7 overflow-hidden rounded-md'>
                        <Image
                          src={iconSrc}
                          alt={app.name}
                          fill
                          sizes='28px'
                          className='object-cover'
                        />
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-medium text-sm'>{app.name}</span>
                        <span className='text-muted-foreground text-[11px]'>
                          App ID: {app.app_id}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

