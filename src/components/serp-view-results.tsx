// src/components/serp-view-results.tsx
import type { SerpViewOutput } from '@/ai/flows/serp-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { ListOrdered, HelpCircle, Link as LinkIcon, Image as ImageIcon, Video, Newspaper, Award } from 'lucide-react';

interface SerpViewResultsProps {
  results: SerpViewOutput;
}

const SerpFeatures: React.FC<{ features: SerpViewOutput['serpFeatures'] }> = ({ features }) => {
    const featureItems = [
        { name: "Featured Snippet", icon: Award, present: features.hasFeaturedSnippet },
        { name: "Image Pack", icon: ImageIcon, present: features.hasImagePack },
        { name: "Video Carousel", icon: Video, present: features.hasVideoCarousel },
        { name: "Top Stories", icon: Newspaper, present: features.topStories },
    ].filter(item => item.present);

    if (featureItems.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6 bg-muted/50">
            <CardHeader>
                <CardTitle className="font-headline text-lg">SERP Features Detected</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {featureItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Badge key={item.name} variant="secondary" className="text-sm py-1 px-3">
                                <Icon className="h-4 w-4 mr-2" />
                                {item.name}
                            </Badge>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default function SerpViewResults({ results }: SerpViewResultsProps) {
  return (
    <div className="space-y-6 mt-8">
      
      {results.serpFeatures && <SerpFeatures features={results.serpFeatures} />}
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListOrdered /> Organic Search Results
          </CardTitle>
          <CardDescription>
            A simulation of the top 10 organic search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.organicResults.map((result) => (
            <div key={result.position} className="flex gap-4">
              <div className="text-lg font-bold text-muted-foreground">{result.position}.</div>
              <div>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-lg">
                  <h3 className="font-headline">{result.title}</h3>
                </a>
                <div className="flex items-center gap-2 text-green-700 text-sm font-body">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{result.url}</span>
                </div>
                <p className="text-muted-foreground text-sm font-body mt-1">{result.snippet}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {results.peopleAlsoAsk && results.peopleAlsoAsk.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <HelpCircle /> People Also Ask
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {results.peopleAlsoAsk.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-body text-left hover:no-underline">{item.question}</AccordionTrigger>
                  <AccordionContent className="font-body text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
