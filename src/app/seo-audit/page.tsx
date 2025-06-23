
'use client';
  import * as React from 'react';
  import { useEffect, useRef, useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
  import { CheckCircle, AlertTriangle, ExternalLink, Loader2, FileText, ImageIcon, Link2Off, Zap, Smartphone } from "lucide-react";
  import useProtectedRoute from '@/hooks/useProtectedRoute';
  import { useAuth } from '@/context/AuthContext';
  import { db } from '@/lib/firebase';
  import { collection, addDoc, Timestamp } from 'firebase/firestore';
  import { useToast } from '@/hooks/use-toast';
  import { auditUrl, AuditUrlOutput } from '@/ai/flows/seo-audit';

  interface AuditResultItem {
    id: string;
    name: string;
    score: number;
    details: string;
    status: 'good' | 'warning' | 'error';
  }
  interface AuditResult {
    overallScore: number;
    items: (AuditResultItem & { icon: React.ElementType })[];
    summary: string;
  }

  const ICONS: { [key: string]: React.ElementType } = {
    'title-tags': FileText,
    'meta-descriptions': FileText,
    'h1-tags': FileText,
    'image-alts': ImageIcon,
    'content-readability': FileText,
    'site-speed': Zap,
    'mobile-friendliness': Smartphone,
    'broken-links': Link2Off,
  };
  const getIconForItem = (id: string) => ICONS[id] || FileText;

    function getValidUrl(input: string) {
      if (!input.trim()) return '';
      if (!/^https?:\/\//i.test(input)) {
        return `https://${input}`;
      }
      return input;
    }

    const isValidUrl = (urlString: string): boolean => {
      try {
        const url = new URL(getValidUrl(urlString));
        return /\.[a-z]{2,}$/i.test(url.hostname);
      } catch (e) {
        return false;
      }
    };

  export default function SeoAuditPage() {
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [auditResults, setAuditResults] = useState<AuditResult | null>(null);

    const { user, loading: authLoading } = useProtectedRoute();
    const { profile, user: currentUser } = useAuth();
    const { toast } = useToast();
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading) {
            if (profile && profile.targetWebsite) {
                setUrl(profile.targetWebsite);
            }
        }
    }, [authLoading, profile]);

    useEffect(() => {
        if (auditResults) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [auditResults]);


    if (authLoading) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
      return null;
    }

    const handleStartAudit = async () => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
          toast({
              title: "URL is empty",
              description: "Please enter a URL to start the audit.",
              variant: "destructive",
          });
          return;
      }

      if (!isValidUrl(trimmedUrl)) {
          toast({
              title: "Invalid URL",
              description: "Please enter a valid website URL to start the audit (e.g., example.com).",
              variant: "destructive",
          });
          return;
      }

      setIsLoading(true);
      setAuditResults(null);

      try {
        if (!currentUser) {
            throw new Error("Authentication token not available.");
        }

        const validUrl = getValidUrl(url.trim());
        const data = await auditUrl({ url: validUrl });

        const displayResult: AuditResult = {
          overallScore: data.overallScore,
          items: data.items.map(item => ({
            ...item,
            icon: getIconForItem(item.id),
          })),
          summary: data.summary,
        }

        setAuditResults(displayResult);

         // Save activity to Firestore
        const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
        await addDoc(activitiesCollectionRef, {
            type: "seo_audit",
            tool: "SEO Audit",
            timestamp: Timestamp.now(),
            details: {
                url: validUrl,
                overallScore: data.overallScore,
                criticalIssuesCount: data.items.filter(item => item.status === 'error').length,
                warningIssuesCount: data.items.filter(item => item.status === 'warning').length,
            },
            resultsSummary: `Audit of ${new URL(validUrl).hostname} completed. Score: ${data.overallScore}/100.`,
        });

      } catch (error: any) {
        console.error("Detailed audit error:", error);
        toast({
          title: "Audit Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleStartAudit();
    };

    const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
      if (status === 'good') return <CheckCircle className="h-6 w-6 text-green-500" />;
      if (status === 'warning') return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    };

    const getProgressColor = (score: number) => {
      if (score > 85) return "bg-green-500";
      if (score > 60) return "bg-yellow-500";
      return "bg-red-500";
    }

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-semibold text-foreground">Technical SEO Audit</h1>
        <p className="text-muted-foreground font-body">Analyze a URL to uncover technical issues and content optimization opportunities that could be affecting your search engine ranking.</p>

        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Audit Your Site</CardTitle>
            <CardDescription className="font-body">
              Enter your website URL to perform a comprehensive technical and content SEO audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-body flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !url.trim()} className="font-body w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Start Audit
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">
                Auditing your site... This may take up to a minute.
              </p>
            </CardContent>
          </Card>
        )}

        <div ref={resultsRef}>
          {auditResults && !isLoading && (
            <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
              <CardHeader>
                <CardTitle className="font-headline">
                  Audit Report for {url.trim() ? new URL(getValidUrl(url)).hostname : 'your site'}
                </CardTitle>
                <CardDescription className="font-body">This report provides a prioritized list of SEO issues. Addressing the 'error' and 'warning' items will have the most impact on your ranking.</CardDescription>
                 <div className="flex items-center space-x-4 pt-2">
                    <div className="text-4xl font-bold font-headline" style={{color: getProgressColor(auditResults.overallScore).replace('bg-', 'var(--')}}>{auditResults.overallScore}/100</div>
                      <div>
                        <h3 className="font-semibold">Overall Score</h3>
                        <p className="text-sm text-muted-foreground">A summary of your site&apos;s SEO health.</p>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <h4 className="font-headline text-lg font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground font-body mb-6">{auditResults.summary}</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] text-center">Status</TableHead>
                      <TableHead>Audit Check</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditResults.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="flex justify-center">{getStatusIcon(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {React.createElement(item.icon, { className: "h-6 w-6 text-muted-foreground" })}
                             <span className="font-medium font-body">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{item.score}/100</TableCell>
                        <TableCell className="text-sm text-muted-foreground font-body">{item.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
