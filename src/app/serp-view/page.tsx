'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Link as LinkIcon, Star, MessageSquare, Image as ImageIcon, Loader2 } from "lucide-react";
import useProtectedRoute from '@/hooks/useProtectedRoute';

interface SerpResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  position: number;
  isFeaturedSnippet?: boolean;
  isPeopleAlsoAsk?: boolean;
  isImagePack?: boolean;
}

export default function SerpViewPage() {
  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serpResults, setSerpResults] = useState<SerpResult[] | null>(null);
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

  const handleFetchSerp = () => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    setSerpResults(null);
    // Simulate API call
    setTimeout(() => {
      const mockResults: SerpResult[] = [
        { id: 'fs1', title: `What is ${keyword}? - Comprehensive Guide`, url: 'example.com/guide', snippet: `An in-depth explanation of ${keyword}, covering all aspects and providing useful examples. Learn more now!`, position: 0, isFeaturedSnippet: true },
        { id: '1', title: `Understanding ${keyword}: A Beginner's Overview`, url: 'another-site.org/beginners-keyword', snippet: `Get started with ${keyword}. This guide breaks down the basics in an easy-to-understand format. Perfect for newcomers.`, position: 1 },
        { id: 'paa1', title: `Related questions about ${keyword}`, url: '#', snippet: `How does ${keyword} work? What are the benefits of ${keyword}?`, position: 2, isPeopleAlsoAsk: true },
        { id: '2', title: `${keyword} Solutions and Services - Top Provider`, url: 'service-pro.com/keyword-solutions', snippet: `Discover top-tier ${keyword} solutions tailored to your needs. We offer expert services and support. Contact us for a quote.`, position: 3 },
        { id: 'img1', title: `Images for ${keyword}`, url: '#', snippet: `A collection of relevant images for ${keyword}.`, position: 4, isImagePack: true, },
        { id: '3', title: `The Future of ${keyword} - Trends & Predictions`, url: 'tech-journal.net/future-keyword', snippet: `Explore the evolving landscape of ${keyword} and what the future holds. Expert insights and analysis on upcoming trends.`, position: 5 },
      ];
      setSerpResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-headline font-semibold text-foreground">SERP Visualization</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Analyze SERP</CardTitle>
          <CardDescription className="font-body">Enter a keyword to see a mock Search Engine Results Page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter target keyword (e.g., best cat food)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="font-body"
            />
            <Button onClick={handleFetchSerp} disabled={isLoading || !keyword.trim()} className="font-body">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Fetch SERP
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-md">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-muted-foreground">Fetching SERP data...</p>
          </CardContent>
        </Card>
      )}

      {serpResults && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Search Results for "{keyword}"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {serpResults.map(result => (
              <div key={result.id} className={`p-4 rounded-lg border ${result.isFeaturedSnippet ? 'border-primary bg-primary/10 shadow-md' : 'bg-card'}`}>
                {result.isFeaturedSnippet && (
                  <div className="flex items-center text-sm text-primary font-medium mb-1 font-body">
                    <Star className="h-4 w-4 mr-1 fill-primary" /> Featured Snippet
                  </div>
                )}
                 {result.isPeopleAlsoAsk && (
                  <div className="flex items-center text-sm text-accent-foreground font-medium mb-1 font-body">
                    <MessageSquare className="h-4 w-4 mr-1 text-accent" /> People Also Ask
                  </div>
                )}
                {result.isImagePack && (
                  <div className="flex items-center text-sm text-accent-foreground font-medium mb-1 font-body">
                    <ImageIcon className="h-4 w-4 mr-1 text-accent" /> Image Pack
                  </div>
                )}
                <h3 className="text-lg font-medium text-primary hover:underline font-headline">
                  <a href={result.url} target="_blank" rel="noopener noreferrer">{result.position > 0 && `${result.position}. `}{result.title}</a>
                </h3>
                {!result.isImagePack && !result.isPeopleAlsoAsk && (
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 dark:text-green-400 block truncate font-body">{result.url}</a>
                )}
                <p className="text-sm text-muted-foreground mt-1 font-body">{result.snippet}</p>
                {result.isImagePack && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="aspect-square bg-muted rounded flex items-center justify-center">
                                <ImageIcon className="w-1/2 h-1/2 text-muted-foreground/50" data-ai-hint="abstract photo" />
                            </div>
                        ))}
                    </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {serpResults?.length === 0 && !isLoading && (
        <Card className="shadow-md">
            <CardContent className="p-6">
                <p className="font-body text-muted-foreground text-center">No results to display for this keyword.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
