export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
