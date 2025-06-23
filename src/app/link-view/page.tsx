'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link as LinkIcon, Search, ExternalLink, Loader2, BarChart2, Globe } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';

interface Backlink {
  id: string;
  referringDomain: string;
  backlinkUrl: string;
  anchorText: string;
  domainAuthority: number; // Example metric
}

      function getValidUrl(url: string) {
        if (!/^https?:\/\//i.test(url)) {
          return `https://${url}`;
        }
        return url;
      }
export default function LinkViewPage() {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backlinks, setBacklinks] = useState<Backlink[] | null>(null);
  const [summary, setSummary] = useState<{ totalBacklinks: number; referringDomains: number } | null>(null);

   const { user, loading } = useProtectedRoute();

  if (loading) {
    // Show a loading indicator while checking authentication state
    return <div>Loading...</div>;
  }

  if (!user) {
    // This part should ideally not be reached due to the redirect,
    // but it's a safeguard. You could render nothing or a message.
    return null;
  }

  const handleAnalyzeLinks = () => {
    if (!targetUrl.trim()) return;
    setIsLoading(true);
    setBacklinks(null);
    setSummary(null);

    // Simulate API call
    setTimeout(() => {
      const mockBacklinks: Backlink[] = Array.from({ length: Math.floor(Math.random() * 20) + 5 }).map((_, i) => ({
        id: `bl-${i}`,
        referringDomain: `competitor${i + 1}.com`,
        backlinkUrl: `https://competitor${i + 1}.com/blog/post-${i}`,
        anchorText: `Example Link ${i + 1}`,
        domainAuthority: Math.floor(Math.random() * 100),
      }));
      
      setBacklinks(mockBacklinks);
      setSummary({
        totalBacklinks: mockBacklinks.length,
        referringDomains: new Set(mockBacklinks.map(bl => bl.referringDomain)).size,
      });
      setIsLoading(false);
    }, 2000);
  };


    
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Link Analysis</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Analyze Backlinks</CardTitle>
          <CardDescription className="font-body">Enter a URL to discover its backlink profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="font-body"
            />
            <Button onClick={handleAnalyzeLinks} disabled={isLoading || !targetUrl.trim()} className="font-body">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Analyze Links
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Fetching backlink data...</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-body">Total Backlinks</CardTitle>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-headline">{summary.totalBacklinks.toLocaleString()}</div>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-body">Referring Domains</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-headline">{summary.referringDomains.toLocaleString()}</div>
                </CardContent>
            </Card>
        </div>
      )}


      {backlinks && backlinks.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Backlinks for {new URL(getValidUrl(targetUrl)).hostname}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Referring Domain</TableHead>
                  <TableHead className="font-body">Backlink URL</TableHead>
                  <TableHead className="font-body">Anchor Text</TableHead>
                  <TableHead className="font-body text-right">DA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlinks.map(link => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium font-body">{link.referringDomain}</TableCell>
                    <TableCell>
                      <a href={link.backlinkUrl} target="_blank" rel="noopener noreferrer" className="font-body text-primary hover:underline flex items-center">
                        <span className="truncate max-w-xs">{link.backlinkUrl}</span>
                        <ExternalLink className="h-3 w-3 ml-1 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="font-body truncate max-w-xs">{link.anchorText}</TableCell>
                    <TableCell className="text-right font-body">{link.domainAuthority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {backlinks && backlinks.length === 0 && !isLoading && (
         <Card className="shadow-md">
            <CardContent className="p-6">
                <p className="font-body text-muted-foreground text-center">No backlinks found for this URL.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
