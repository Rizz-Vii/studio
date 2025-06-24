
// src/components/ui/loading-screen.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BarChart, LineChart, PieChart, Database } from 'lucide-react';

const stages = [
  { text: "Initializing Engines...", icon: PieChart },
  { text: "Connecting to Your Data Universe...", icon: BarChart },
  { text: "Fetching Stellar Metrics...", icon: LineChart },
  { text: "Finalizing Your Dashboard...", icon: Database },
  { text: "Ready for Launch!", icon: Rocket },
];

const funFacts = [
  "Did you know? Pages that load in 1 second have a 3x higher conversion rate.",
  "43% of websites never get a technical SEO audit. You're already ahead!",
  "Content with relevant images gets 94% more views.",
  "75% of users never scroll past the first page of search results.",
];

export default function LoadingScreen() {
  const [currentStage, setCurrentStage] = useState(0);
  const [funFactIndex, setFunFactIndex] = useState(0);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1200); // Change stage every 1.2 seconds

    const factInterval = setInterval(() => {
        setFunFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 2500); // Change fact every 2.5 seconds

    return () => {
      clearInterval(stageInterval);
      clearInterval(factInterval);
    };
  }, []);

  const StageIcon = stages[currentStage].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm text-foreground font-body">
      <div className="w-full max-w-md p-8 space-y-8 text-center">
        <motion.div
            animate={{ 
                rotate: [0, -5, 5, -5, 0],
                y: [0, -15, 0]
            }}
            transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
            }}
        >
          <Rocket className="w-20 h-20 text-primary mx-auto" />
        </motion.div>

        <div className="relative w-full h-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStage}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center gap-2"
                >
                    <StageIcon className="w-5 h-5 text-accent" />
                    <p className="text-lg font-headline">{stages[currentStage].text}</p>
                </motion.div>
            </AnimatePresence>
        </div>
        
        <div className="h-10 relative">
            <AnimatePresence mode="wait">
                 <motion.p
                    key={funFactIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs text-muted-foreground italic absolute inset-0"
                >
                    {funFacts[funFactIndex]}
                </motion.p>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
