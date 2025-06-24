// src/components/seo-audit-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { AuditUrlInput } from '@/ai/flows/seo-audit';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface SeoAuditFormProps {
  onSubmit: (values: AuditUrlInput) => Promise<void>;
  isLoading: boolean;
}

export default function SeoAuditForm({ onSubmit, isLoading }: SeoAuditFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: '' },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Technical SEO Audit</CardTitle>
                <CardDescription className="font-body">Enter a URL to run a quick technical and content SEO audit.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL to Audit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Run Audit
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
