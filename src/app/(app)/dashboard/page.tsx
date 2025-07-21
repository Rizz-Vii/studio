// src/app/(app)/dashboard/page.tsx
"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Activity,
  KeyRound,
  ShieldCheck,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { Variants, motion } from "framer-motion";
import { dummyDashboardData } from "@/lib/dummy-data";
import { useEffect, useState } from "react";
import ToolGrid from "@/components/tool-grid";
import { useIsMobile } from "@/hooks/use-mobile";

// ----- CHART CONFIGS -----

const lineChartConfig = {
  score: { label: "Score", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const barChartConfig = {
  new: { label: "New", color: "hsl(var(--chart-1))" },
  lost: { label: "Lost", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const pieChartConfig = {
  sources: { label: "Traffic Sources" },
  "Organic Search": { label: "Organic", color: "hsl(var(--chart-1))" },
  Direct: { label: "Direct", color: "hsl(var(--chart-2))" },
  Referral: { label: "Referral", color: "hsl(var(--chart-3))" },
  Social: { label: "Social", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

// ----- REUSABLE COMPONENTS -----

const DashboardMetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
}> = ({ title, value, change, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium font-body">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold font-headline">{value}</div>
      {change !== undefined && (
        <p
          className={`text-xs ${change >= 0 ? "text-success" : "text-destructive"}`}
        >
          {change >= 0 ? `+${change}` : change} from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const SeoScoreTrendChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-headline">Overall SEO Score</CardTitle>
      <CardDescription>
        Your site&apos;s SEO score trend over the last 6 weeks.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={lineChartConfig} className="h-[200px] w-full">
        <ResponsiveContainer>
          <LineChart
            data={dummyDashboardData.seoScoreTrend}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) =>
                new Date(val).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              tickLine={false}
              axisLine={false}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <ChartTooltipContent {...props} indicator="line" />
              )}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-score)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
);

const KeywordVisibilityChart = () => {
  const data = [
    {
      name: "Visibility",
      value: dummyDashboardData.keywordVisibility.score,
      fill: "hsl(var(--chart-1))",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Keyword Visibility</CardTitle>
        <CardDescription>
          Your share of clicks for tracked keywords.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={lineChartConfig} className="h-[200px] w-full">
          <RadialBarChart
            data={data}
            startAngle={-270}
            endAngle={90}
            innerRadius="70%"
            outerRadius="110%"
            barSize={30}
          >
            <PolarGrid gridType="circle" radialLines={false} stroke="none" />
            <RadialBar background dataKey="value" cornerRadius={10} />
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-4xl font-headline fill-foreground"
            >
              {`${dummyDashboardData.keywordVisibility.score}%`}
            </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const DomainAuthorityChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-headline">Domain Authority</CardTitle>
      <CardDescription>
        Your domain&apos;s authority score over the last 6 months.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={lineChartConfig} className="h-[200px] w-full">
        <LineChart
          data={dummyDashboardData.domainAuthority.history}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(val) =>
              new Date(val).toLocaleDateString("en-US", { month: "short" })
            }
            tickLine={false}
            axisLine={false}
          />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={(props) => (
              <ChartTooltipContent {...props} indicator="line" />
            )}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-score)"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

const BacklinksChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-headline">Backlink Growth</CardTitle>
      <CardDescription>
        New vs. Lost backlinks over the last 6 months.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={barChartConfig} className="h-[200px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={dummyDashboardData.backlinks.history}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <ChartTooltipContent {...props} indicator="line" />
              )}
            />
            <Bar dataKey="new" fill="var(--color-new)" radius={4} />
            <Bar dataKey="lost" fill="var(--color-lost)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
);

const TrafficSourcesChart = () => (
  <Card>
    <CardHeader>
      <CardTitle className="font-headline">Traffic Sources</CardTitle>
      <CardDescription>
        Breakdown of your website traffic sources.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-center">
      <ChartContainer config={pieChartConfig} className="h-[200px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <ChartTooltipContent {...props} indicator="line" />
              )}
            />
            <Pie
              data={dummyDashboardData.trafficSources}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              strokeWidth={5}
            >
              {dummyDashboardData.trafficSources.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                  {payload?.map((entry) => (
                    <div
                      key={`legend-${entry.value}`}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
);

// ----- MAIN COMPONENT -----

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        mass: 0.5,
      },
    },
  };

  if (authLoading || !mounted) {
    return <LoadingScreen fullScreen text="Loading dashboard data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        layoutId="dashboard-header"
      >
        <h1 className="text-3xl font-headline font-semibold text-foreground">
          Welcome, {profile?.displayName || user?.email}!
        </h1>
        <p className="text-muted-foreground font-body">
          Here&apos;s your SEO command center at a glance.
        </p>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <DashboardMetricCard
            title="Overall SEO Score"
            value={String(dummyDashboardData.seoScore.current)}
            change={dummyDashboardData.seoScore.change}
            icon={Activity}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardMetricCard
            title="Tracked Keywords"
            value={dummyDashboardData.trackedKeywords.current.toLocaleString()}
            change={dummyDashboardData.trackedKeywords.change}
            icon={KeyRound}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardMetricCard
            title="Domain Authority"
            value={String(dummyDashboardData.domainAuthority.score)}
            change={dummyDashboardData.domainAuthority.score - 52}
            icon={ShieldCheck}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardMetricCard
            title="Total Backlinks"
            value={dummyDashboardData.backlinks.total.toLocaleString()}
            change={dummyDashboardData.backlinks.newLast30Days}
            icon={LinkIcon}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <SeoScoreTrendChart />
        </motion.div>
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <TrafficSourcesChart />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <KeywordVisibilityChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <BacklinksChart />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <DomainAuthorityChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <BacklinksChart />
        </motion.div>
      </motion.div>

      {/* Mobile Tool Grid */}
      {isMobile && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">SEO Tools</CardTitle>
              <CardDescription>
                Quick access to all your SEO analysis tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ToolGrid />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
