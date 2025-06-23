
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tag, PlusCircle, Trash2, Loader2, Info } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { analyzeCompetitors, CompetitorAnalysisOutput } from '@/ai/flows/competitor-analysis';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface Competitor {
  id: string;
  url: string;
}

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
              <Info className="h-3 w-3 text-muted-foreground" />
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
  const [nextId, setNextId] = useState(1);
  const [competitors, setCompetitors] = useState<Competitor[]>([{ id: 'comp-0', url: '' }]);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisOutput | null>(null);

  const { user, loading } = useProtectedRoute();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysisResult) {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);


  const addCompetitor = () => {
    setCompetitors([...competitors, { id: `comp-${nextId}`, url: '' }]);
    setNextId(prevId => prevId + 1);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const handleCompetitorChange = (id: string, value: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, url: value } : c));
  };
  
  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };


  const handleAnalyze = async () => {
    const trimmedYourUrl = yourUrl.trim();
    if (!isValidUrl(trimmedYourUrl)) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL for your website.", variant: "destructive" });
        return;
    }
    const invalidCompetitor = competitors.find(c => c.url.trim() !== '' && !isValidUrl(c.url));
    if (invalidCompetitor) {
        toast({ title: "Invalid Competitor URL", description: `Please check the URL: ${invalidCompetitor.url}`, variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    const validCompetitorUrls = competitors
      .map(c => c.url.trim())
      .filter(url => url !== '');
      
    const validKeywords = keywords.filter(k => k.trim() !== '');

    try {
      if (!currentUser) {
        throw new Error("Authentication token not available.");
      }

      const result = await analyzeCompetitors({
        yourUrl: getValidUrl(yourUrl),
        competitorUrls: validCompetitorUrls.map(url => getValidUrl(url)),
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
           competitors: validCompetitorUrls,
           keywords: validKeywords,
         },
         resultsSummary: `Analyzed ${validCompetitorUrls.length} competitors for ${validKeywords.length} keywords.`,
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
                            keywords.every(k => !k.trim()) ||
                            competitors.some(c => c.url.trim() !== '' && !isValidUrl(c.url));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">Competitor Analysis</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Setup Analysis</CardTitle>
          <CardDescription className="font-body">Enter your URL, competitor URLs, and keywords to compare rankings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="yourUrl" className="block text-sm font-medium text-foreground font-body mb-1">Your URL</label>
            <Input
              id="yourUrl"
              type="url"
              placeholder="https://yourwebsite.com"
              value={yourUrl}
              onChange={(e) => setYourUrl(e.target.value)}
              className="font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground font-body mb-1">Competitor URLs</label>
            {competitors.map((competitor, index) => (
              <div key={competitor.id} className="flex items-center space-x-2 mb-2">
                <Input
                  type="url"
                  placeholder={`competitor${index + 1}.com`}
                  value={competitor.url}
                  onChange={(e) => handleCompetitorChange(competitor.id, e.target.value)}
                  className="font-body"
                />
                {competitors.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeCompetitor(competitor.id)} aria-label="Remove competitor">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCompetitor} className="font-body">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Competitor
            </Button>
          </div>

          <div>
             <label className="block text-sm font-medium text-foreground font-body mb-1">Keywords</label>
            {keywords.map((keyword, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder={`Keyword ${index + 1}`}
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="font-body"
                />
                {keywords.length > 1 ? (
                  <Button variant="ghost" size="icon" onClick={() => removeKeyword(index)} aria-label="Remove keyword">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                ) : <div className="w-9 h-9"></div>}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addKeyword} className="font-body">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Keyword
            </Button>
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
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Analyzing... this may take a moment.</p>
          </CardContent>
        </Card>
      )}
      
      <div ref={resultsRef}>
        {analysisResult && (
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Keyword Rankings Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body">Keyword</TableHead>
                    <TableHead className="font-body text-center">Your Rank</TableHead>
                    {competitors.filter(c => c.url.trim() !== '').map(comp => (
                      <TableHead key={comp.id} className="font-body text-center truncate max-w-[150px]" title={getValidUrl(comp.url)}>{getHostname(comp.url)}</TableHead>
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
                      {competitors.filter(c => c.url.trim() !== '').map(comp => (
                        <TableCell key={comp.id} className="text-center font-body">
                          <RankCell rankInfo={(row as any)[getValidUrl(comp.url)]} />
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
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Content Gap Opportunities</CardTitle>
              <CardDescription className="font-body">Keywords your competitors rank for, but you might be missing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysisResult.contentGaps.map((gap, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-secondary rounded-md">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-body text-sm">{gap}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {analysisResult && analysisResult.contentGaps && analysisResult.contentGaps.length === 0 && (
           <Card className="shadow-md mt-8">
            <CardContent className="p-6">
               <p className="font-body text-muted-foreground text-center">No significant content gaps found compared to these competitors.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
