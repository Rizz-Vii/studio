'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tag, Tags, PlusCircle, Trash2, Loader2 } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';
interface Competitor {
  id: string;
  url: string;
}

interface RankingData {
  keyword: string;
  yourRank?: number | string;
  [competitorUrl: string]: number | string | undefined;
}

export default function CompetitorsPage() {
  const [yourUrl, setYourUrl] = useState<string>('');
  const [competitors, setCompetitors] = useState<Competitor[]>([{ id: crypto.randomUUID(), url: '' }]);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rankingData, setRankingData] = useState<RankingData[] | null>(null);
  const [contentGaps, setContentGaps] = useState<string[] | null>(null);

  const addCompetitor = () => {
    setCompetitors([...competitors, { id: crypto.randomUUID(), url: '' }]);
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


  const handleAnalyze = () => {
    setIsLoading(true);
    setRankingData(null);
    setContentGaps(null);
    // Simulate API call
    setTimeout(() => {
      const mockRankings: RankingData[] = keywords.filter(k => k.trim() !== '').map(kw => {
        const data: RankingData = { keyword: kw, yourRank: Math.random() > 0.2 ? Math.floor(Math.random() * 50) + 1 : 'N/A' };
        competitors.forEach(comp => {
          if (comp.url.trim() !== '') {
            data[comp.url] = Math.random() > 0.1 ? Math.floor(Math.random() * 50) + 1 : 'N/A';
          }
        });
        return data;
      });
      setRankingData(mockRankings);

      const mockGaps = ['long-tail keyword example', 'competitor specific term']
        .filter(() => Math.random() > 0.5); // Randomly include some gaps
      setContentGaps(mockGaps);
      
      setIsLoading(false);
    }, 2000);
  };
    const { user, loading } = useProtectedRoute();
  
        if (loading) {
          // Show a loading spinner or skeleton while authentication state is being checked
          return <div>Loading...</div>;
        }
  
        if (!user) {
          // This part should ideally not be reached due to the redirect in useProtectedRoute,
          // but it's good practice to handle the case where user is null.
          return null;
        }

  return (
    <div className="space-y-8">
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
                  placeholder={`https://competitor${index + 1}.com`}
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
          <Button onClick={handleAnalyze} disabled={isLoading || !yourUrl.trim() || keywords.every(k => !k.trim())} className="font-body w-full sm:w-auto">
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

      {rankingData && (
        <Card className="shadow-lg">
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
                    <TableHead key={comp.id} className="font-body text-center truncate max-w-[150px]" title={comp.url}>{new URL(comp.url).hostname}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((row) => (
                  <TableRow key={row.keyword}>
                    <TableCell className="font-medium font-body">{row.keyword}</TableCell>
                    <TableCell className="text-center font-body">{row.yourRank ?? 'N/A'}</TableCell>
                    {competitors.filter(c => c.url.trim() !== '').map(comp => (
                      <TableCell key={comp.id} className="text-center font-body">{row[comp.url] ?? 'N/A'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {contentGaps && contentGaps.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Content Gap Opportunities</CardTitle>
            <CardDescription className="font-body">Keywords your competitors rank for, but you might be missing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {contentGaps.map((gap, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-secondary rounded-md">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-body text-sm">{gap}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {rankingData && contentGaps && contentGaps.length === 0 && (
         <Card className="shadow-md">
          <CardContent className="p-6">
             <p className="font-body text-muted-foreground text-center">No significant content gaps found compared to these competitors.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


