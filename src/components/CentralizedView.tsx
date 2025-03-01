export function CentralizedView({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">{children}</main>
  );
}
