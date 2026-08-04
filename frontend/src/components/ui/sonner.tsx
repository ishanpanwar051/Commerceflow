
'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { useEffect, useState } from 'react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const [position, setPosition] = useState<'bottom-center' | 'bottom-left' | 'bottom-right'>('bottom-right');

  useEffect(() => {
    const handleResize = () => {
      setPosition(window.innerWidth < 768 ? 'bottom-center' : 'bottom-right');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={position}
      className="toaster group"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:animate-in group-[.toaster]:slide-in-from-bottom-5',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      richColors
      gap={16}
      {...props}
    />
  );
};

export { Toaster };
