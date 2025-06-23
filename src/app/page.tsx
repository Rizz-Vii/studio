
'use client';
import React from 'react';
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Rocket, Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6 }
    })
  };

export default function HomePage() {
    const features = [
        {
          title: "Site Audit",
          desc: "Crawl your site for broken links, indexability, page speed, meta issues, and more.",
          icon: Search,
          detailedDescription: "Our comprehensive Site Audit tool crawls every page of your website to identify technical SEO issues that could be harming your rankings. We check for over 100 common problems, including broken links, slow page load times, missing or duplicate meta tags, and crawlability errors. Get a prioritized list of issues with clear, actionable recommendations to improve your site's health."
        },
        {
          title: "Keyword Intelligence",
          desc: "Track keywords, visibility scores, and keyword gaps with real-time updates.",
          icon: TrendingUp,
          detailedDescription: "Discover high-potential keywords your customers are searching for. Our AI-powered tool provides thousands of suggestions, including long-tail variations and questions. Track your ranking positions in real-time, monitor your overall search visibility, and identify valuable keyword gaps between you and your competitors to inform your content strategy."
        },
        {
          title: "Competitor Tracking",
          desc: "Benchmark your SEO progress against your top rivals with historical trend graphs.",
          icon: Rocket,
          detailedDescription: "Stay ahead of the competition by tracking their every move. Monitor your competitors' keyword rankings, see their top-performing content, and analyze their backlink profiles. Our side-by-side comparisons and historical data trends help you identify opportunities to outrank them and capture more market share."
        },
      ];

  return (
    <main className="flex flex-col items-center justify-start min-h-screen px-4 py-12 bg-white text-gray-900">
        
        <motion.div
        className="fixed top-6 right-6 z-50 bg-white border shadow-md rounded-lg px-4 py-2 hidden md:flex space-x-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        >
        <a href="#pricing" className="text-sm text-blue-600 font-medium hover:underline">Pricing</a>
        <a href="#faq" className="text-sm text-blue-600 font-medium hover:underline">FAQ</a>
        <a href="#about" className="text-sm text-blue-600 font-medium hover:underline">About</a>
        </motion.div>
        
      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeIn} custom={0} className="max-w-6xl w-full text-center pt-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          SEO Insights <span className="text-blue-600">Supercharged by AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Unlock technical, content, and off-page SEO intelligence. Analyze, optimize, and outrank — all from one smart platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">Start Free</Button>
          <Button asChild variant="outline" size="lg">
          <Link href="/register">
            Request Demo
          </Link>
        </Button>
        </div>
      </motion.section>

      {/* Feature Highlights */}
      <section id="features" className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
        {features.map((item, i) => (
            <Dialog key={item.title}>
                <DialogTrigger asChild>
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={i} className="cursor-pointer h-full">
                        <Feature icon={<item.icon />} title={item.title}>{item.desc}</Feature>
                    </motion.div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                        <item.icon className="h-6 w-6 text-primary" />
                        {item.title}
                    </DialogTitle>
                    <DialogDescription className="pt-4 font-body text-base">
                        {item.detailedDescription}
                    </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        ))}
      </section>
      
       {/* Screenshot */}
       <section className="mt-24 w-full max-w-6xl text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Your SEO Command Center</h2>
        <p className="text-gray-600 mb-6">All your SEO tools — crawler, analyzer, optimizer — in one clean, intuitive dashboard designed to turn data into action.</p>
        <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <Image
            src="https://placehold.co/1200x700.png"
            alt="SEO Dashboard Screenshot"
            data-ai-hint="dashboard computer screen"
            width={1200}
            height={700}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* About Us */}
      <motion.section id="about" className="mt-24 w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-6">About RankPilot</h2>
        <p className="text-gray-600 mb-6">
          RankPilot is built to give SEO professionals a single dashboard that replaces half a dozen tools.
          From crawling and content scoring to tracking and reporting — it's all here, powered by AI.
        </p>
      </motion.section>
       
        {/* CTA */}
        <motion.section initial="hidden" animate="visible" variants={fadeIn} custom={7} className="mt-32 max-w-4xl w-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-10 text-white text-center shadow-xl">
                <h4 className="text-3xl font-bold mb-4">Start Ranking Better — Today</h4>
                <p className="text-lg mb-6">Sign up free. No credit card needed. Get results from day one.</p>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">Get Started</Button>
            </motion.section>
         
        {/* Testimonials */}
        <section className="mt-32 text-center max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-8">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Sophie M.",
              company: "Digital Surge",
              text: "RankPilot cut our audit time by 70%. It’s an indispensable tool for our agency."
            },
            {
              name: "James T.",
              company: "eCom Growth",
              text: "We’ve seen a 40% increase in organic traffic since using RankPilot’s recommendations."
            },
            {
              name: "Leila A.",
              company: "SEO Freelance Pro",
              text: "Everything I need — in one dashboard. No more switching tools constantly."
            }
          ].map((t, i) => (
            <motion.div key={i} variants={fadeIn} initial="hidden" animate="visible" custom={i} className="p-6 border rounded-lg shadow bg-white">
              <p className="text-gray-600 italic mb-4">“{t.text}”</p>
              <p className="text-sm font-semibold">— {t.name}, {t.company}</p>
            </motion.div>
          ))}
        </div>
      </section>
        {/* FAQ */}
        <section id="faq" className="mt-24 max-w-3xl w-full text-left">
        <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <FAQ question="Do I need a credit card to sign up?" answer="No. You can start with the free plan immediately — no card required." />
        <FAQ question="What engines do you track?" answer="We currently track Google search results. Bing and others are on the roadmap." />
        <FAQ question="Can I cancel anytime?" answer="Yes, plans are flexible and cancelable anytime through your dashboard." />
      </section>
       
     

      {/* Pricing */}
      <section id="pricing" className="mt-24 text-center max-w-6xl w-full">
        <h2 className="text-3xl font-bold mb-6">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <PricingCard title="Free" price="$0/mo" features={["5 audits/month", "Basic Reports", "Limited Keywords"]} />
          <PricingCard title="Pro" price="$29/mo" features={["50 audits", "Full Reports", "Competitor Tracking"]} />
          <PricingCard title="Agency" price="$99/mo" features={["Unlimited Everything", "White Label", "Priority Support"]} />
        </div>
      </section>

    </main>
  )
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
      <div className="p-6 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition bg-white h-full">
        <div className="text-blue-600 mb-4">{React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}</div>
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-gray-600">{children}</p>
      </div>
    );
  }

function PricingCard({ title, price, features }: { title: string, price: string, features: string[] }) {
    return (
      <div className="border p-6 rounded-xl shadow hover:shadow-lg bg-white">
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-2xl font-semibold mb-4">{price}</p>
        <ul className="text-left space-y-2 text-gray-600">
          {features.map((f, i) => <li key={i}>• {f}</li>)}
        </ul>
        <Button className="mt-6 w-full">Choose Plan</Button>
      </div>
    )
  }
  
  function FAQ({ question, answer }: { question: string, answer: string }) {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold">{question}</h4>
        <p className="text-gray-600">{answer}</p>
      </div>
    )
  }
