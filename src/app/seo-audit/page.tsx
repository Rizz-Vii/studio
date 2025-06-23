
'use client';
  import { useEffect, useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
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
    score: number; // 0-100
    details: string;
    status: 'good' | 'warning' | 'error';
  }
  interface AuditResult {
    overallScore: number;
    items: (AuditResultItem & { icon: React.ElementType })[];
    summary: string;
  }


  const initialAuditItems: (AuditResultItem & { icon: React.ElementType })[] = [
    { id: 'title-tags', name: 'Title Tags', score: 0, details: 'Analyzing title tag length, keyword usage, and uniqueness.', icon: FileText, status: 'warning' },
    { id: 'meta-descriptions', name: 'Meta Descriptions', score: 0, details: 'Checking meta description length and compelling copy.', icon: FileText, status: 'warning' },
    { id: 'h1-tags', name: 'H1 Heading', score: 0, details: 'Verifying the presence and relevance of a single H1 tag.', icon: FileText, status: 'warning'},
    { id: 'image-alts', name: 'Image Alt Texts', score: 0, details: 'Verifying presence and relevance of image alt attributes.', icon: ImageIcon, status: 'warning' },
    { id: 'content-readability', name: 'Content Readability', score: 0, details: 'Assessing readability and use of simple language.', icon: FileText, status: 'warning'},
    { id: 'site-speed', name: 'Site Speed', score: 0, details: 'Evaluating page load times and Core Web Vitals.', icon: Zap, status: 'warning' },
    { id: 'mobile-friendliness', name: 'Mobile-Friendliness', score: 0, details: 'Assessing responsive design and mobile usability.', icon: Smartphone, status: 'warning' },
  ];

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
    const [overallScore, setOverallScore] = useState<number>(0);
    const [currentAuditItems, setCurrentAuditItems] = useState<typeof initialAuditItems>(initialAuditItems); // State for displaying progress

    const { user, loading: authLoading } = useProtectedRoute();
    const { profile, user: currentUser } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading) {
            if (profile && profile.targetWebsite) {
                setUrl(profile.targetWebsite);
            }
        }
    }, [authLoading, profile]);


    if (authLoading) {
      return <div>Loading...</div>;
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
      setOverallScore(0);
      setCurrentAuditItems(initialAuditItems);

      try {
        if (!currentUser) {
            throw new Error("Authentication token not available.");
        }

        const validUrl = getValidUrl(url.trim());
        const data = await auditUrl({ url: validUrl });

        // Map AI results to display format
        const displayItems = initialAuditItems.map(initialItem => {
          const backendItem = data.items.find(item => item.id === initialItem.id);
          return backendItem ? { ...initialItem, ...backendItem } : initialItem;
        });

        const displayResult: AuditResult = {
          overallScore: data.overallScore,
          items: displayItems,
          summary: data.summary,
        }

        setAuditResults(displayResult);
        setOverallScore(displayResult.overallScore);
        setCurrentAuditItems(displayResult.items);

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
        setCurrentAuditItems(initialAuditItems.map(item => ({
          ...item,
          details: 'Failed to analyze.',
          status: 'error',
        })));
      } finally {
        setIsLoading(false);
      }
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleStartAudit();
    };

    const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
      if (status === 'good') return <CheckCircle className="h-5 w-5 text-green-500" />;
      if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    };

    const getProgressColor = (score: number) => {
      if (score > 85) return "bg-green-500";
      if (score > 60) return "bg-yellow-500";
      return "bg-red-500";
    }

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-semibold text-foreground">Technical SEO Audit</h1>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Audit Your Site</CardTitle>
            <CardDescription className="font-body">
              Enter your website URL to perform a technical SEO audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="flex space-x-2">
              <Input
                type="url"
                placeholder="yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-body"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !url.trim()} className="font-body">
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

        {isLoading && !auditResults && (
          <Card className="shadow-md">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">
                Initializing audit... This may take some time depending on your site size.
              </p>
            </CardContent>
          </Card>
        )}

        {(isLoading || auditResults) && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">
                Audit Report for {url.trim() ? new URL(getValidUrl(url)).hostname : 'your site'}
              </CardTitle>
              {auditResults && overallScore > 0 && (
                <div className="flex items-center space-x-2 pt-2">
                  <Progress value={overallScore} className="w-[60%]" indicatorClassName={getProgressColor(overallScore)} />
                  <span
                    className={`text-sm font-medium font-body ${
                      overallScore > 85
                        ? 'text-green-500'
                        : overallScore > 60
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    Overall Score: {overallScore}/100
                  </span>
                </div>
              )}
              {!auditResults && isLoading && (
                <div className="flex items-center space-x-2 pt-2 text-muted-foreground font-body">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Audit in progress...
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAuditItems.map((item) => (
                <Card key={item.id} className="bg-secondary/30 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center">
                      <item.icon
                        className={`h-5 w-5 mr-2 ${
                          item.score > 0
                            ? item.status === 'good'
                              ? 'text-green-500'
                              : item.status === 'warning'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <CardTitle className="text-md font-medium font-body">{item.name}</CardTitle>
                    </div>
                    {item.score > 0 && getStatusIcon(item.status)}
                  </CardHeader>
                  <CardContent>
                    {item.score === 0 && isLoading ? (
                      <div className="flex items-center text-sm text-muted-foreground font-body">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </div>
                    ) : (
                      <>
                        {item.score > 0 && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Progress value={item.score} className={`flex-1`} indicatorClassName={getProgressColor(item.score)} />
                            <span
                              className={`text-xs font-medium ${
                                item.status === 'good'
                                  ? 'text-green-500'
                                  : item.status === 'warning'
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {item.score}/100
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground font-body">{item.details}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {!auditResults && !isLoading && !url.trim() && (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="font-body text-muted-foreground text-center">
                Enter a URL above to start an SEO audit.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
