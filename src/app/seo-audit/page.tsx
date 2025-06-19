'use client'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, ExternalLink, Loader2, FileText, ImageIcon, Link2Off, Zap, Smartphone } from "lucide-react";

interface AuditItem {
  id: string;
  name: string;
  score: number; // 0-100
  details: string;
  icon: React.ElementType;
  status: 'good' | 'warning' | 'error';
}

const initialAuditItems: AuditItem[] = [
  { id: 'title-tags', name: 'Title Tags', score: 0, details: 'Analyzing title tag length, keyword usage, and uniqueness.', icon: FileText, status: 'warning' },
  { id: 'meta-descriptions', name: 'Meta Descriptions', score: 0, details: 'Checking meta description length and compelling copy.', icon: FileText, status: 'warning' },
  { id: 'image-alts', name: 'Image Alt Texts', score: 0, details: 'Verifying presence and relevance of image alt attributes.', icon: ImageIcon, status: 'warning' },
  { id: 'broken-links', name: 'Broken Links', score: 0, details: 'Scanning for internal and external broken links (404s).', icon: Link2Off, status: 'warning' },
  { id: 'site-speed', name: 'Site Speed', score: 0, details: 'Evaluating page load times and Core Web Vitals.', icon: Zap, status: 'warning' },
  { id: 'mobile-friendliness', name: 'Mobile-Friendliness', score: 0, details: 'Assessing responsive design and mobile usability.', icon: Smartphone, status: 'warning' },
];


export default function SeoAuditPage() {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResults, setAuditResults] = useState<AuditItem[] | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);

  const handleStartAudit = () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setAuditResults(null);
    setOverallScore(0);

    // Simulate API call and progressive updates
    let currentResults = [...initialAuditItems];
    setAuditResults(currentResults);

    const updateInterval = 500; // ms
    let itemsProcessed = 0;
    let totalScoreSum = 0;

    const intervalId = setInterval(() => {
      if (itemsProcessed < currentResults.length) {
        const itemIndex = itemsProcessed;
        const randomScore = Math.floor(Math.random() * 61) + 40; // Score between 40-100
        totalScoreSum += randomScore;
        
        currentResults = currentResults.map((item, idx) => 
          idx === itemIndex ? {
            ...item,
            score: randomScore,
            status: randomScore > 85 ? 'good' : randomScore > 60 ? 'warning' : 'error',
            details: randomScore > 85 ? 'Looks good!' : randomScore > 60 ? 'Some improvements needed.' : 'Requires attention.'
          } : item
        );
        setAuditResults([...currentResults]);
        setOverallScore(Math.round(totalScoreSum / (itemsProcessed + 1)));
        itemsProcessed++;
      } else {
        clearInterval(intervalId);
        setIsLoading(false);
      }
    }, updateInterval);
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
          <CardDescription className="font-body">Enter your website URL to perform a technical SEO audit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-body"
            />
            <Button onClick={handleStartAudit} disabled={isLoading || !url.trim()} className="font-body">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Start Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && !auditResults && (
         <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Initializing audit...</p>
          </CardContent>
        </Card>
      )}

      {auditResults && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Audit Report for {new URL(url).hostname}</CardTitle>
            <div className="flex items-center space-x-2 pt-2">
              <Progress value={overallScore} className="w-[60%]" indicatorClassName={getProgressColor(overallScore)} />
              <span className={`text-sm font-medium font-body ${overallScore > 85 ? 'text-green-500' : overallScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                Overall Score: {overallScore}/100
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditResults.map(item => (
              <Card key={item.id} className="bg-secondary/30 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center">
                    <item.icon className={`h-5 w-5 mr-2 ${item.score > 0 ? (item.status === 'good' ? 'text-green-500' : item.status === 'warning' ? 'text-yellow-500' : 'text-red-500') : 'text-muted-foreground' }`} />
                    <CardTitle className="text-md font-medium font-body">{item.name}</CardTitle>
                  </div>
                  {item.score > 0 && getStatusIcon(item.status)}
                </CardHeader>
                <CardContent>
                  {item.score === 0 && isLoading ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 mb-1">
                        <Progress value={item.score} className="flex-1" indicatorClassName={getProgressColor(item.score)}/>
                        <span className={`text-xs font-medium ${item.status === 'good' ? 'text-green-500' : item.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
                          {item.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-body">{item.details}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
