// src/app/(auth)/layout.tsx
import SiteHeader from "@/components/site-header";
import AuthMobileNav from "@/components/auth-mobile-nav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      {/* Mobile Navigation for Auth Pages */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <AuthMobileNav />
      </div>
      
      <main className="flex-grow flex items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
