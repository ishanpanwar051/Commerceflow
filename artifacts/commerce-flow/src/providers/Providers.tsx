import { StoreProvider } from './StoreProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
