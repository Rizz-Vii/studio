
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Link as LinkIcon, HelpCircle, UserCheck, BarChart2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ContentBriefInput, ContentBriefOutput } from '@/ai/flows/content-brief';
import { useRef, useEffect } from 'react';

const formSchema = z.object({
  keyword: z.string().min(3, { message: 'Keyword must be at least 3 characters long.' }),
});

type ContentBriefFormValues = z.infer<typeof formSchema>;

interface ContentBriefFormProps {
  onSubmit: (values: ContentBriefInput) => Promise<void>;
  isLoading: boolean;
  briefResult: ContentBriefOutput | null;
  error: string | null;
}

const ResultCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="pb-4">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Icon className="h-6 w-6 text-primary" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

export default function ContentBriefForm({ onSubmit, isLoading, briefResult, error }: ContentBriefFormProps) {
  const form = useForm<ContentBriefFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { keyword: '' },
  });

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (briefResult || error) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [briefResult, error]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Generate a Content Brief</CardTitle>
          <CardDescription className="font-body">
            Enter a target keyword to generate a comprehensive SEO content brief.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent>
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Target Keyword</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., how to start a podcast"
                        {...field}
                        className="font-body"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription className="font-body">
                      The primary keyword you want to rank for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="font-body w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Brief
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div ref={resultsRef}>
        {isLoading && (
          <Card className="shadow-md mt-8">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">Generating your content brief...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="shadow-md border-destructive mt-8">
            <CardHeader>
              <CardTitle className="text-destructive font-headline">Generation Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-body text-destructive-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {briefResult && (
          <div className="space-y-6 mt-8">
              <ResultCard title="Title and Meta" icon={FileText}>
                  <div className="space-y-4">
                      <div>
                          <h4 className="font-semibold font-body">Suggested Title</h4>
                          <p className="text-muted-foreground font-body">{briefResult.suggestedTitle}</p>
                      </div>
                      <div>
                          <h4 className="font-semibold font-body">Meta Description</h4>
                          <p className="text-muted-foreground font-body">{briefResult.metaDescription}</p>
                      </div>
                  </div>
              </ResultCard>

              <div className="grid md:grid-cols-2 gap-6">
                  <ResultCard title="Targeting" icon={UserCheck}>
                      <div className="space-y-4">
                           <div>
                              <h4 className="font-semibold font-body">Target Audience</h4>
                              <p className="text-muted-foreground font-body">{briefResult.targetAudience}</p>
                          </div>
                          <div>
                              <h4 className="font-semibold font-body">Word Count</h4>
                              <p className="text-muted-foreground font-body">{briefResult.wordCount.min} - {briefResult.wordCount.max} words</p>
                          </div>
                      </div>
                  </ResultCard>

                  <ResultCard title="Content Structure" icon={BarChart2}>
                      <ul className="space-y-2 list-disc pl-5">
                          {briefResult.suggestedHeadings.map((heading, i) => (
                              <li key={i} className={`font-body ${heading.startsWith('H3') ? 'ml-4' : 'font-semibold'}`}>
                                  {heading.replace(/^H[23]: /, '')}
                              </li>
                          ))}
                      </ul>
                  </ResultCard>
              </div>

              <ResultCard title="Semantic Keywords (LSI)" icon={Tag}>
                  <CardDescription className="mb-4 -mt-2">Incorporating these related terms helps search engines understand the context and depth of your content, improving its chances to rank for a wider range of queries.</CardDescription>
                  <div className="flex flex-wrap gap-2">
                      {briefResult.lsiKeywords.map((lsi, i) => (
                          <Badge key={i} variant={lsi.type === 'topic' ? 'default' : lsi.type === 'entity' ? 'secondary' : 'outline'}>
                              {lsi.keyword}
                          </Badge>
                      ))}
                  </div>
              </ResultCard>

              <ResultCard title="Questions to Answer" icon={HelpCircle}>
                 <CardDescription className="mb-4 -mt-2">Directly answering these common user questions can help you capture "People Also Ask" features in search results.</CardDescription>
                  <ul className="space-y-2 list-disc pl-5 font-body">
                      {briefResult.questionsToAnswer.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
              </ResultCard>

              <ResultCard title="Linking Suggestions" icon={LinkIcon}>
                   <CardDescription className="mb-4 -mt-2">Internal links help search engines discover your content and understand the relationships between your pages, distributing link equity throughout your site.</CardDescription>
                   <ul className="space-y-2 list-disc pl-5 font-body">
                      {briefResult.internalLinkingSuggestions.map((link, i) => (
                          <li key={i}>
                              Anchor Text: <span className="font-semibold text-primary">{link.anchorText}</span> &rarr; Link to: <span className="italic">{link.linkTo}</span>
                          </li>
                      ))}
                  </ul>
              </ResultCard>
          </div>
        )}
      </div>
    </div>
  );
}
