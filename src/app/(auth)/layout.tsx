// src/app/(auth)/layout.tsx
import SiteHeader from '@/components/site-header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center py-12">
          {children}
        </main>
    </div>
  );
}
