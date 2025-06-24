// src/app/(auth)/layout.tsx
import Link from 'next/link';
import { AppLogo, AppName } from '@/constants/nav';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <header className="mb-8">
        <Link
          href="/"
          className="flex flex-col items-center gap-2 text-primary transition-colors hover:text-primary/90"
        >
          <AppLogo className="h-12 w-12" />
          <span className="text-3xl font-bold font-headline">{AppName}</span>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
