import { Button } from '@/components/ui/button';
import { IconBrandGithub } from '@tabler/icons-react';

export default function CtaGithub() {
  return (
    <Button variant='ghost' asChild size='sm' className='group hidden sm:flex'>
      <a
        href='#'
        rel='noopener noreferrer'
        target='_self'
        className='dark:text-foreground transition-colors duration-300 hover:text-[#24292e] dark:hover:text-yellow-400'
      >
        <IconBrandGithub className='transition-transform duration-300 group-hover:animate-bounce' />
      </a>
    </Button>
  );
}
