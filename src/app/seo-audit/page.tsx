import { NextRequest, NextResponse } from 'next/server';
import { auditUrl } from '@/ai/flows/seo-audit';
import { z } from 'zod';

const RequestBodySchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = RequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { url } = validationResult.data;
    const auditResult = await auditUrl({ url });
    return NextResponse.json(auditResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred during the audit' }, { status: 500 });
  }
}
  'use client';
  import { useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
  import { CheckCircle, AlertTriangle, ExternalLink, Loader2, FileText, ImageIcon, Link2Off, Zap, Smartphone } from "lucide-react";
  import useProtectedRoute from '@/hooks/useProtectedRoute';
  import { useAuth } from '@/context/AuthContext'; // Import useAuth
  import { db } from '@/lib/firebase'; // Import db
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 


  interface BackendAuditResultItem {
    id: string;
    name: string;
    score: number; // 0-100
    details: string;
    icon: React.ElementType;
    status: 'good' | 'warning' | 'error';
  }
  interface BackendAuditResult {
    overallScore: number;
    items: BackendAuditResultItem[];
    // potentially other summary data
  }


  const initialAuditItems: BackendAuditResultItem[] = [
    { id: 'title-tags', name: 'Title Tags', score: 0, details: 'Analyzing title tag length, keyword usage, and uniqueness.', icon: FileText, status: 'warning' },
    { id: 'meta-descriptions', name: 'Meta Descriptions', score: 0, details: 'Checking meta description length and compelling copy.', icon: FileText, status: 'warning' },
    { id: 'image-alts', name: 'Image Alt Texts', score: 0, details: 'Verifying presence and relevance of image alt attributes.', icon: ImageIcon, status: 'warning' },
    { id: 'broken-links', name: 'Broken Links', score: 0, details: 'Scanning for internal and external broken links (404s).', icon: Link2Off, status: 'warning' },
    { id: 'site-speed', name: 'Site Speed', score: 0, details: 'Evaluating page load times and Core Web Vitals.', icon: Zap, status: 'warning' },
    { id: 'mobile-friendliness', name: 'Mobile-Friendliness', score: 0, details: 'Assessing responsive design and mobile usability.', icon: Smartphone, status: 'warning' },
  ];

    function getValidUrl(input: string) {
      if (!/^https?:\/\//i.test(input)) {
        return `https://${input}`;
      }
      return input;
    }
    const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
      if (status === 'good') return <CheckCircle className="h-5 w-5 text-green-500" />;
      if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    };
    
    const getProgressColor = (score: number) => {
      if (score > 85) return "bg-green-500";
      if (score > 60) return "bg-yellow-500";
      return "bg-red-500";
    };

  export default function SeoAuditPage() {
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [auditResults, setAuditResults] = useState<BackendAuditResult | null>(null);
    const [overallScore, setOverallScore] = useState<number>(0);
    const [currentAuditItems, setCurrentAuditItems] = useState<typeof initialAuditItems>(initialAuditItems); // State for displaying progress

    const { user, loading: authLoading } = useProtectedRoute();
    const { user: currentUser } = useAuth();


    if (authLoading) {
      // Show a loading indicator while checking authentication state
      return <div>Loading...</div>;
    }

    if (!user) {
      // This part should ideally not be reached due to the redirect,
      // but it's a safeguard. You could render nothing or a message.
      return null;
    }
    const handleStartAudit = async () => {
      if (!url.trim()) return;
      setIsLoading(true);
      setAuditResults(null);
      setOverallScore(0);
      setCurrentAuditItems(initialAuditItems); // Reset displayed items
    
      if (!currentUser) {
        console.error("No authenticated user to save activity.");
        setIsLoading(false);
        // Optionally show an error message
        return;
      }
    
      try {
        // **Make API call to your backend audit endpoint**
        const validUrl = getValidUrl(url.trim());
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
          body: JSON.stringify({ url: validUrl }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data: BackendAuditResult = await response.json();
        setAuditResults(data);
        setOverallScore(data.overallScore);
    
        // Update the displayed items with results from the backend
        setCurrentAuditItems(initialAuditItems.map(initialItem => {
          const backendItem = data.items.find(item => item.id === initialItem.id);
          return backendItem ? { ...initialItem, ...backendItem } : initialItem;
        }));
    
        // **Save the user activity to Firestore**
        const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
        await addDoc(activitiesCollectionRef, {
          type: "seo_audit",
          tool: "SEO Audit",
          timestamp: serverTimestamp(),
          details: {
            url: validUrl,
            overallScore: data.overallScore,
            criticalIssuesCount: data.items.filter(item => item.status === 'error').length,
            warningIssuesCount: data.items.filter(item => item.status === 'warning').length,
          },
          resultsSummary: `Audit of ${validUrl} completed. Score: ${data.overallScore}/100. Critical Issues: ${data.items.filter(item => item.status === 'error').length}`,
        });
    
      } catch (error: any) {
        console.error("Error starting audit:", error);
        // Update the displayed items to show error or completion status
        setCurrentAuditItems(initialAuditItems.map(item => ({
          ...item,
          details: item.score === 0 ? 'Failed to analyze.' : item.details,
          status: item.score === 0 ? 'error' : item.status,
        })));
        // Optionally show an error message to the user using toast
      } finally {
        setIsLoading(false);
      }
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
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold text-foreground">Technical SEO Audit</h1>
    
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Audit Your Site</CardTitle>
            <CardDescription className="font-body">
              Enter your website URL to perform a technical SEO audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-body"
                disabled={isLoading}
              />
              <Button onClick={handleStartAudit} disabled={isLoading || !url.trim()} className="font-body">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Start Audit
              </Button>
            </div>
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
    
        {/* Always display audit items once audit is started, show progress or results */}
        {currentAuditItems.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">
                Audit Report for {url.trim() ? new URL(getValidUrl(url)).hostname : 'your site'}
              </CardTitle>
              {/* Show overall score only if results are available */}
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
                    {/* Show status icon only if score is available or not loading */}
                    {item.score > 0 && getStatusIcon(item.status)}
                  </CardHeader>
                  <CardContent>
                    {item.score === 0 && isLoading ? (
                      <div className="flex items-center text-sm text-muted-foreground font-body">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </div>
                    ) : (
                      <>
                        {/* Show progress bar and score only if score is available */}
                        {item.score > 0 && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Progress value={item.score} className={`flex-1 ${getProgressColor(item.score)}`} />
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
    
        {/* Show a message if auditResults is null and not loading (e.g., after an error or initial state) */}
        {!auditResults && !isLoading && url.trim() && (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="font-body text-muted-foreground text-center">
                Failed to load audit results. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
    
        {/* Message for when no URL is entered yet */}
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
