// src/components/serp-view-results.tsx
import type { SerpViewOutput } from '@/ai/flows/serp-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ListOrdered, HelpCircle } from 'lucide-react';

interface SerpViewResultsProps {
  results: SerpViewOutput;
}

export default function SerpViewResults({ results }: SerpViewResultsProps) {
  return (
    <div className="space-y-6 mt-8">
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
                <p className="text-green-700 text-sm font-body">{result.url}</p>
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
                    Answer details would appear here in a full implementation.
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
