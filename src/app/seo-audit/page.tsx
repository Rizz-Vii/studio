
'use client';
  import { useEffect, useState } from 'react';
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
  import { CheckCircle, AlertTriangle, ExternalLink, Loader2, FileText, ImageIcon, Link2Off, Zap, Smartphone } from "lucide-react";
  import useProtectedRoute from '@/hooks/useProtectedRoute';
  import { useAuth } from '@/context/AuthContext';
  import { functions } from '@/lib/firebase';
  import { httpsCallable } from 'firebase/functions';
  import { useToast } from '@/hooks/use-toast';


  interface BackendAuditResultItem {
    id: string;
    name: string;
    score: number; // 0-100
    details: string;
    status: 'good' | 'warning' | 'error';
  }
  interface BackendAuditResult {
    overallScore: number;
    items: (BackendAuditResultItem & { icon: React.ElementType })[];
  }


  const initialAuditItems: (BackendAuditResultItem & { icon: React.ElementType })[] = [
    { id: 'title-tags', name: 'Title Tags', score: 0, details: 'Analyzing title tag length, keyword usage, and uniqueness.', icon: FileText, status: 'warning' },
    { id: 'meta-descriptions', name: 'Meta Descriptions', score: 0, details: 'Checking meta description length and compelling copy.', icon: FileText, status: 'warning' },
    { id: 'image-alts', name: 'Image Alt Texts', score: 0, details: 'Verifying presence and relevance of image alt attributes.', icon: ImageIcon, status: 'warning' },
    { id: 'broken-links', name: 'Broken Links', score: 0, details: 'Scanning for internal and external broken links (404s).', icon: Link2Off, status: 'warning' },
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
        // Use the URL constructor for validation, which is a modern and robust approach.
        // It requires a protocol, which getValidUrl ensures is present.
        const url = new URL(getValidUrl(urlString));
        // A simple regex to ensure it looks like a domain name and not just "https://abc"
        return /\.[a-z]{2,}$/i.test(url.hostname);
      } catch (e) {
        return false;
      }
    };
    
  export default function SeoAuditPage() {
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [auditResults, setAuditResults] = useState<BackendAuditResult | null>(null);
    const [overallScore, setOverallScore] = useState<number>(0);
    const [currentAuditItems, setCurrentAuditItems] = useState<typeof initialAuditItems>(initialAuditItems); // State for displaying progress

    const { user, loading: authLoading } = useProtectedRoute();
    const { profile } = useAuth();
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
        const validUrl = getValidUrl(url.trim());
        const payload = { url: validUrl };
        console.log("Calling 'auditUrl' function with payload:", payload);
        
        const auditUrlFunction = httpsCallable< { url: string }, BackendAuditResult>(functions, 'auditUrl');
        const result = await auditUrlFunction(payload);
        const data = result.data;
        
        setAuditResults(data);
        setOverallScore(data.overallScore);
    
        setCurrentAuditItems(initialAuditItems.map(initialItem => {
          const backendItem = data.items.find(item => item.id === initialItem.id);
          return backendItem ? { ...initialItem, ...backendItem } : initialItem;
        }));
    
      } catch (error: any) {
        console.error("Detailed audit error:", error);
        
        let title = "Audit Failed";
        let description = "An unexpected error occurred. Please try again.";

        if (error.code && error.message) {
            switch(error.code) {
                case 'invalid-argument':
                    title = 'Invalid URL';
                    description = error.details?.errorMessage || "The URL provided could not be reached. Please check the URL and try again.";
                    break;
                case 'unauthenticated':
                    title = 'Authentication Error';
                    description = 'You must be logged in to perform an audit.';
                    break;
                case 'internal':
                    title = 'Server Error';
                    description = "An internal server error occurred on our end. Our team has been notified. Please try again later.";
                    break;
                default:
                    title = `Error: ${error.code.replace(/-/g, ' ')}`;
                    description = error.message;
            }
        } else if (error.message) {
            description = error.message;
        }

        toast({
          title: title,
          description: description,
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

