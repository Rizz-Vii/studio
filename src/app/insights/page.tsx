'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useProtectedRoute from '@/hooks/useProtectedRoute';

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'Technical SEO' | 'Content' | 'Link Building' | 'Keywords';
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: 'High' | 'Medium' | 'Low';
  actionLink?: string; // Optional link to relevant tool/page
  actionText?: string;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Optimize Title Tags for Key Landing Pages',
    description: 'Several important pages have title tags that are too long or not optimized for target keywords. This can impact click-through rates from SERPs.',
    category: 'Technical SEO',
    priority: 'High',
    estimatedImpact: 'Medium',
    actionLink: '/seo-audit',
    actionText: 'View Audit'
  },
  {
    id: '2',
    title: 'Create Content for "Long-Tail AI Keywords"',
    description: 'Your competitors are ranking for several long-tail keywords related to AI that you are not targeting. Creating focused content can capture this traffic.',
    category: 'Content',
    priority: 'High',
    estimatedImpact: 'High',
    actionLink: '/keyword-tool',
    actionText: 'Find Keywords'
  },
  {
    id: '3',
    title: 'Improve Mobile Page Speed',
    description: 'Mobile page speed for several key pages is below average. This affects user experience and can impact mobile rankings.',
    category: 'Technical SEO',
    priority: 'Medium',
    estimatedImpact: 'High',
    actionLink: '/seo-audit',
    actionText: 'Check Site Speed'
  },
  {
    id: '4',
    title: 'Acquire Backlinks from Authoritative Tech Blogs',
    description: 'Your backlink profile lacks links from high-authority domains in the tech niche. Outreach to relevant blogs could improve your domain authority.',
    category: 'Link Building',
    priority: 'Medium',
    estimatedImpact: 'Medium',
     actionLink: '/link-view',
    actionText: 'Analyze Links'
  },
  {
    id: '5',
    title: 'Update Old Blog Posts with Fresh Information',
    description: 'Some older blog posts are still receiving traffic but contain outdated information. Refreshing them could improve engagement and rankings.',
    category: 'Content',
    priority: 'Low',
    estimatedImpact: 'Medium',
    actionLink: '/content-analyzer',
    actionText: 'Analyze Content'
  },
];

const getPriorityBadgeVariant = (priority: 'High' | 'Medium' | 'Low'): "destructive" | "secondary" | "outline" => {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'secondary'; // Using secondary for yellow-ish tone
  return 'outline';
};

const getImpactIcon = (impact: 'High' | 'Medium' | 'Low') => {
  if (impact === 'High') return <Zap className="h-4 w-4 text-red-500" />;
  if (impact === 'Medium') return <Zap className="h-4 w-4 text-yellow-500" />;
  return <Zap className="h-4 w-4 text-green-500" />;
};


export default function InsightsPage() {
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


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold text-foreground">Actionable Insights</h1>
        <p className="text-muted-foreground font-body">Prioritized recommendations to boost your SEO performance.</p>
      </div>
      

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {mockInsights.map(insight => (
          <Card key={insight.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="font-headline text-lg">{insight.title}</CardTitle>
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getPriorityBadgeVariant(insight.priority)} className="font-body">{insight.priority} Priority</Badge>
                <Badge variant="outline" className="font-body">{insight.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground font-body mb-3">{insight.description}</p>
              <div className="flex items-center text-xs text-muted-foreground font-body">
                {getImpactIcon(insight.estimatedImpact)}
                <span className="ml-1">Estimated Impact: {insight.estimatedImpact}</span>
              </div>
            </CardContent>
            {insight.actionLink && insight.actionText && (
            <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full font-body">
              <Link href={insight.actionLink} passHref> {/* Remove legacyBehavior */}
                  {insight.actionText} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
           </Button>
            </CardFooter>
          )}
          </Card>
        ))}
      </div>
       {mockInsights.length === 0 && (
         <Card className="shadow-md">
            <CardContent className="p-10 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-headline mb-2">No Critical Insights!</h3>
                <p className="font-body text-muted-foreground">Your SEO looks good for now. Keep monitoring for new opportunities.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
