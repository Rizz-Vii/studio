// src/components/link-analysis-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { LinkAnalysisInput } from "@/ai/flows/link-analysis";
import { useHydrated } from "./../hooks/useHydrated";

const formSchema = z.object({
  url: z.string().min(1, { message: "Please enter a valid URL." }),
});

type FormValues = z.infer<typeof formSchema>;

interface LinkAnalysisFormProps {
  onFormSubmit: (values: LinkAnalysisInput) => Promise<void>;
  isLoading: boolean;
}

export default function LinkAnalysisForm({
  onFormSubmit,
  isLoading,
}: LinkAnalysisFormProps) {
  const hydrated = useHydrated();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
  });

  function handleFormSubmit(values: FormValues) {
    const normalizeUrl = (url: string): string => {
      const trimmed = url.trim();
      if (!trimmed) {
        return "";
      }
      if (!/^(https?:\/\/)/i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    };

    const submissionValues: LinkAnalysisInput = {
      url: normalizeUrl(values.url),
    };
    onFormSubmit(submissionValues);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Backlink Analyzer</CardTitle>
        <CardDescription className="font-body">
          Enter a URL to discover its backlink profile.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-8"
        >
          <CardContent>
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL to Analyze</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="www.example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Backlinks
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
