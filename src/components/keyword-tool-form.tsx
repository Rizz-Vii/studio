// src/components/keyword-tool-form.tsx
"use client";

import type { SuggestKeywordsInput } from "@/ai/flows/keyword-suggestions";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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

const formSchema = z.object({
  topic: z
    .string()
    .min(3, { message: "Topic must be at least 3 characters long." }),
  includeLongTailKeywords: z.boolean().default(false).optional(),
});

type KeywordFormValues = z.infer<typeof formSchema>;

interface KeywordToolFormProps {
  onSubmit: (values: SuggestKeywordsInput) => Promise<void>;
  isLoading: boolean;
}

export default function KeywordToolForm({
  onSubmit,
  isLoading,
}: KeywordToolFormProps) {
  const form = useForm<KeywordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      includeLongTailKeywords: false,
    },
  });

  async function handleFormSubmit(values: KeywordFormValues) {
    await onSubmit(values as SuggestKeywordsInput);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Discover Keywords</CardTitle>
        <CardDescription className="font-body">
          Enter a topic to get AI-powered keyword suggestions.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-8"
        >
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <FormLabel className="font-body">Topic</FormLabel>
                      <Input
                        placeholder="e.g., sustainable gardening, AI in marketing"
                        {...field}
                        className="font-body"
                        disabled={isLoading}
                      />
                      <FormDescription className="font-body">
                        What topic do you want keywords for?
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="includeLongTailKeywords"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <div className="space-y-1 leading-none">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />

                      <FormLabel className="font-body">
                        Include Long-Tail Keywords
                      </FormLabel>
                      <FormDescription className="font-body">
                        Get more specific, longer keyword phrases. The AI will
                        determine if it's appropriate.
                      </FormDescription>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="font-body w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Suggest Keywords
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
