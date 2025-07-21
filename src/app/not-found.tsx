import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/keyword-tool">Try Keyword Tool</Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>RankPilot - AI-First SEO Platform</p>
        </div>
      </div>
    </div>
  );
}
