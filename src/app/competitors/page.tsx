
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tag, Loader2, Info } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { analyzeCompetitors, CompetitorAnalysisOutput } from '@/ai/flows/competitor-analysis';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RankInfo = {
  rank: number | 'N/A';
  reason?: string;
} | undefined;


const RankCell = ({ rankInfo }: { rankInfo: RankInfo }) => {
  if (!rankInfo || rankInfo.rank === undefined) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const hasReason = rankInfo.reason && rankInfo.reason.trim() !== '';

  if (hasReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center justify-center gap-1 cursor-help">
              {rankInfo.rank}
              <Info className="h-4 w-4 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{rankInfo.reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span>{rankInfo.rank}</span>;
};


function getValidUrl(url: string): string {
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

function getHostname(url: string): string {
    if (!url.trim()) {
        return '';
    }
    try {
        return new URL(getValidUrl(url)).hostname;
    } catch (e) {
        // If the URL is invalid, return the original string, truncated if necessary
        return url.length > 30 ? url.substring(0, 27) + '...' : url;
    }
}


export default function CompetitorsPage() {
  const [yourUrl, setYourUrl] = useState<string>('');
  const [competitorsInput, setCompetitorsInput] = useState<string>('');
  const [keywordsInput, setKeywordsInput] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisOutput | null>(null);
  const [analyzedCompetitors, setAnalyzedCompetitors] = useState<string[]>([]);


  const { user, loading } = useProtectedRoute();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysisResult) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);

  const handleAnalyze = async () => {
    const trimmedYourUrl = yourUrl.trim();
    if (!isValidUrl(trimmedYourUrl)) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL for your website.", variant: "destructive" });
        return;
    }

    const competitorUrls = [...new Set(competitorsInput
        .split(/[\n,]+/)
        .map(url => url.trim())
        .filter(Boolean))];

    const invalidCompetitor = competitorUrls.find(url => !isValidUrl(url));
    if (invalidCompetitor) {
        toast({ title: "Invalid Competitor URL", description: `Please check the URL: ${invalidCompetitor}`, variant: "destructive" });
        return;
    }
      
    // Filter out empty keywords and remove duplicates (case-insensitive)
    const validKeywords = [
        ...new Set(keywordsInput.split(/[\n,]+/).map(k => k.trim().toLowerCase()).filter(Boolean))
    ];

    if (validKeywords.length === 0) {
        toast({ title: "No Keywords", description: "Please enter at least one keyword.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalyzedCompetitors(competitorUrls);

    try {
      if (!currentUser) {
        throw new Error("Authentication token not available.");
      }

      const result = await analyzeCompetitors({
        yourUrl: getValidUrl(yourUrl),
        competitorUrls: competitorUrls.map(url => getValidUrl(url)),
        keywords: validKeywords,
      });

      setAnalysisResult(result);

      // Log activity
       const activitiesCollectionRef = collection(db, "users", currentUser.uid, "activities");
       await addDoc(activitiesCollectionRef, {
         type: "competitor_analysis",
         tool: "Competitor Analysis",
         timestamp: serverTimestamp(),
         details: {
           yourUrl,
           competitors: competitorUrls,
           keywords: validKeywords,
         },
         resultsSummary: `Analyzed ${competitorUrls.length} competitors for ${validKeywords.length} keywords.`,
       });

    } catch (error) {
        console.error("Competitor analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "Could not retrieve competitor data. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isAnalyzeDisabled = isLoading ||
                            !isValidUrl(yourUrl) ||
                            !keywordsInput.trim();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Competitor Analysis</h1>
      <p className="text-muted-foreground font-body">Compare your keyword rankings against your competitors to identify strategic advantages and uncover content gaps.</p>

      <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="font-headline">Setup Analysis</CardTitle>
          <CardDescription className="font-body">Enter your URL, competitor URLs, and keywords to compare rankings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="yourUrl" className="block text-sm font-medium text-foreground font-body mb-1">Your URL</label>
            <Input
              id="yourUrl"
              type="text"
              placeholder="https://yourwebsite.com"
              value={yourUrl}
              onChange={(e) => setYourUrl(e.target.value)}
              className="font-body"
            />
          </div>

          <div>
            <label htmlFor="competitorUrls" className="block text-sm font-medium text-foreground font-body mb-1">Competitor URLs</label>
            <Textarea
              id="competitorUrls"
              placeholder="Enter one competitor URL per line or separated by commas"
              value={competitorsInput}
              onChange={(e) => setCompetitorsInput(e.target.value)}
              className="font-body min-h-[80px]"
            />
          </div>

          <div>
             <label htmlFor="keywords" className="block text-sm font-medium text-foreground font-body mb-1">Keywords</label>
             <Textarea
               id="keywords"
               placeholder="Enter one keyword per line or separated by commas"
               value={keywordsInput}
               onChange={(e) => setKeywordsInput(e.target.value)}
               className="font-body min-h-[100px]"
             />
          </div>

        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="font-body w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze Rankings
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <Card className="shadow-lg">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Analyzing... this may take a moment.</p>
          </CardContent>
        </Card>
      )}
      
      <div ref={resultsRef}>
        {analysisResult && (
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Keyword Rankings Comparison</CardTitle>
              <CardDescription className="font-body">This is a simulated search engine ranking for each keyword. "N/A" indicates a rank outside the top 100. Hover over results with an info icon for more details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Keyword</TableHead>
                    <TableHead className="font-body text-center">Your Rank</TableHead>
                    {analyzedCompetitors.map((url, index) => (
                      <TableHead key={`${url}-${index}`} className="font-body text-center truncate max-w-[150px]" title={getValidUrl(url)}>{getHostname(url)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResult.rankings.map((row, index) => (
                    <TableRow key={`${row.keyword}-${index}`}>
                      <TableCell className="font-medium font-body">{row.keyword}</TableCell>
                      <TableCell className="text-center font-body">
                          <RankCell rankInfo={row.yourRank} />
                      </TableCell>
                      {analyzedCompetitors.map((url, i) => (
                        <TableCell key={`${url}-${i}`} className="text-center font-body">
                          <RankCell rankInfo={(row as any)[getValidUrl(url)]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {analysisResult && analysisResult.contentGaps && analysisResult.contentGaps.length > 0 && (
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Content Gap Opportunities</CardTitle>
              <CardDescription className="font-body">These are keywords where your competitors rank highly but you don't. Use these as inspiration for new content to capture more traffic.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {analysisResult.contentGaps.map((gap, index) => (
                <div key={index} className="flex items-center p-2 bg-secondary rounded-md transition-all duration-200 hover:bg-muted shadow-sm hover:shadow-md">
                  <Tag className="h-5 w-5 text-primary mr-2" />
                  <span className="font-body text-sm">{gap}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {analysisResult && analysisResult.contentGaps && analysisResult.contentGaps.length === 0 && (
           <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
            <CardContent className="p-6">
               <p className="font-body text-muted-foreground text-center">No significant content gaps found compared to these competitors.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
