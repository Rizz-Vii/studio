
'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link as LinkIcon, Search, ExternalLink, Loader2, Globe } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { analyzeLinks, LinkAnalysisOutput } from '@/ai/flows/link-analysis';

interface Backlink {
  referringDomain: string;
  backlinkUrl: string;
  anchorText: string;
  domainAuthority: number;
}

function getValidUrl(url: string) {
    if (!url.trim()) return '';
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
}

const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return false;
    try {
        const url = new URL(getValidUrl(urlString));
        // A simple check for a TLD to avoid single-word inputs like "test"
        return /\.[a-z]{2,}$/i.test(url.hostname);
    } catch (e) {
        return false;
    }
};

export default function LinkViewPage() {
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backlinks, setBacklinks] = useState<Backlink[] | null>(null);
  const [summary, setSummary] = useState<LinkAnalysisOutput['summary'] | null>(null);

  const { user, loading } = useProtectedRoute();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (backlinks) {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [backlinks]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleAnalyzeLinks = async () => {
    if (!isValidUrl(targetUrl)) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setBacklinks(null);
    setSummary(null);

    try {
        if (!currentUser) {
            throw new Error("Authentication token not available.");
        }
        
        const validUrl = getValidUrl(targetUrl);
        const result = await analyzeLinks({ url: validUrl });

        setBacklinks(result.backlinks.map((b, i) => ({ ...b, id: `bl-${i}` })));
        setSummary(result.summary);

        const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
        await addDoc(activitiesCollectionRef, {
          type: "link_analysis",
          tool: "Link View",
          timestamp: serverTimestamp(),
          details: {
            url: validUrl,
          },
          resultsSummary: `Found ${result.summary.totalBacklinks} backlinks from ${result.summary.referringDomains} domains for ${new URL(validUrl).hostname}.`,
        });

    } catch (error) {
        console.error("Link analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "Could not retrieve backlink data. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAnalyzeLinks();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Link Analysis</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Analyze Backlinks</CardTitle>
          <CardDescription className="font-body">Enter a URL to discover its backlink profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleFormSubmit}>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="font-body"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !targetUrl.trim()} className="font-body">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Analyze Links
                </Button>
              </div>
            </CardContent>
        </form>
      </Card>

      {isLoading && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Fetching backlink data...</p>
          </CardContent>
        </Card>
      )}

      <div ref={resultsRef}>
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
            <Card className="shadow-lg mt-8">
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
                    {backlinks.map((link, index) => (
                      <TableRow key={`${link.backlinkUrl}-${index}`}>
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
             <Card className="shadow-md mt-8">
                <CardContent className="p-6">
                    <p className="font-body text-muted-foreground text-center">No backlinks found for this URL.</p>
                </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
