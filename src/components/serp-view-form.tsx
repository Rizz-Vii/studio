// src/components/serp-view-form.tsx
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

const formSchema = z.object({
  keyword: z.string().min(2, { message: "Please enter a keyword." }),
});

type FormValues = z.infer<typeof formSchema>;

interface SerpViewFormProps {
  onSubmit: (values: FormValues) => Promise<void>;
  isLoading: boolean;
}

export default function SerpViewForm({
  onSubmit,
  isLoading,
}: SerpViewFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { keyword: "" },
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">SERP Visualizer</CardTitle>
        <CardDescription className="font-body">
          Enter a keyword to see a simulated Search Engine Results Page.
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
                  <FormLabel>Keyword</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., best seo tools 2025"
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
              Visualize SERP
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
