import { Link } from 'wouter';
import { ShieldCheck } from 'lucide-react';

export default function StaffAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="h-16 flex items-center justify-between px-6 bg-background border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>CommerceFlow Staff</span>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to store
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        Authorized staff access only. &copy; {new Date().getFullYear()} CommerceFlow.
      </footer>
    </div>
  );
}
