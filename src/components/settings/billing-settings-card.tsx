"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  ExternalLink, 
  Crown, 
  Calendar, 
  Loader2,
  Download,
  DollarSign,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import type { User } from "firebase/auth";
import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, onSnapshot } from "firebase/firestore";
import { functions, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const createPortalSession = httpsCallable(functions, 'createPortalSession');
const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

interface BillingData {
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'incomplete' | 'free';
  subscriptionTier: 'starter' | 'professional' | 'enterprise' | 'free';
  billingInterval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  subscriptionId?: string;
  customerId?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  usage: {
    keywordsTracked: number;
    keywordsLimit: number;
    competitorAnalysis: number;
    competitorLimit: number;
    reportsGenerated: number;
    apiCalls: number;
    apiLimit: number;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    downloadUrl?: string;
  }>;
}

interface BillingSettingsCardProps {
  user: User;
  profile: any;
}

const planFeatures = {
  starter: {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    features: ["50 keywords", "5 competitors", "Basic audit", "Email support"]
  },
  professional: {
    name: "Professional", 
    price: { monthly: 79, yearly: 790 },
    features: ["500 keywords", "25 competitors", "Advanced audit", "Priority support", "API access"]
  },
  enterprise: {
    name: "Enterprise",
    price: { monthly: 199, yearly: 1990 },
    features: ["Unlimited keywords", "Unlimited competitors", "Premium audit", "24/7 support", "Custom integrations"]
  },
  free: {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    features: ["10 keywords", "1 competitor", "Basic features"]
  }
};

export default function BillingSettingsCard({
  user,
  profile,
}: BillingSettingsCardProps) {
  const { toast: shadToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Real-time subscription data from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setBillingData({
            subscriptionStatus: data.subscriptionStatus || 'free',
            subscriptionTier: data.subscriptionTier || 'free', 
            billingInterval: data.billingInterval || 'monthly',
            currentPeriodStart: data.currentPeriodStart || '',
            currentPeriodEnd: data.currentPeriodEnd || '',
            nextBillingDate: data.nextBillingDate || '',
            subscriptionId: data.subscriptionId,
            customerId: data.customerId,
            paymentMethod: data.paymentMethod,
            usage: {
              keywordsTracked: data.usage?.keywordsTracked || 0,
              keywordsLimit: data.usage?.keywordsLimit || 10,
              competitorAnalysis: data.usage?.competitorAnalysis || 0,
              competitorLimit: data.usage?.competitorLimit || 1,
              reportsGenerated: data.usage?.reportsGenerated || 0,
              apiCalls: data.usage?.apiCalls || 0,
              apiLimit: data.usage?.apiLimit || 100,
            },
            invoices: data.invoices || []
          });
        }
      },
      (error) => {
        console.error('Error fetching billing data:', error);
        toast.error('Failed to load billing information');
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      
      const result = await createPortalSession({
        userId: user.uid,
      });

      const { url } = result.data as { url: string };
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, interval: 'monthly' | 'yearly') => {
    try {
      setIsUpgrading(true);
      
      const result = await createCheckoutSession({
        userId: user.uid,
        priceId: `price_${plan}_${interval}`,
        plan,
        interval
      });

      const { url } = result.data as { url: string };
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'incomplete':
        return <Badge variant="outline">Incomplete</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!billingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading billing information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = planFeatures[billingData.subscriptionTier];
  const currentPrice = currentPlan.price[billingData.billingInterval];

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
            {getStatusBadge(billingData.subscriptionStatus)}
          </div>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                {billingData.subscriptionTier === 'free' ? 
                  'Free plan' : 
                  `$${currentPrice}/${billingData.billingInterval}`
                }
              </p>
            </div>
            {billingData.subscriptionTier !== 'free' && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-semibold">{formatDate(billingData.nextBillingDate)}</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {billingData.subscriptionTier === 'free' ? (
              <div className="md:col-span-2">
                <h4 className="font-medium mb-3">Upgrade to unlock more features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(planFeatures).filter(([key]) => key !== 'free').map(([key, plan]) => (
                    <Card key={key} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <h5 className="font-semibold mb-2">{plan.name}</h5>
                        <p className="text-lg font-bold mb-2">${plan.price.monthly}/mo</p>
                        <Button 
                          className="w-full mb-2" 
                          size="sm"
                          onClick={() => handleUpgrade(key, 'monthly')}
                          disabled={isUpgrading}
                        >
                          {isUpgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade'}
                        </Button>
                        <ul className="text-xs space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Button 
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pricing">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All Plans
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            {formatDate(billingData.currentPeriodStart)} - {formatDate(billingData.currentPeriodEnd)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Keywords Tracked</span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.keywordsTracked} / {billingData.usage.keywordsLimit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min((billingData.usage.keywordsTracked / billingData.usage.keywordsLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Competitor Analysis</span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.competitorAnalysis} / {billingData.usage.competitorLimit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min((billingData.usage.competitorAnalysis / billingData.usage.competitorLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Calls</span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.apiCalls} / {billingData.usage.apiLimit}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reports Generated</span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.reportsGenerated} this month
                </span>
              </div>
            </div>
          </div>

          {/* Usage Warnings */}
          <AnimatePresence>
            {billingData.usage.keywordsTracked / billingData.usage.keywordsLimit > 0.8 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Approaching keyword limit
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  You're using {Math.round((billingData.usage.keywordsTracked / billingData.usage.keywordsLimit) * 100)}% of your keyword quota.
                  {billingData.subscriptionTier !== 'enterprise' && ' Consider upgrading for unlimited tracking.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {billingData.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-muted rounded">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {billingData.paymentMethod.brand} ending in {billingData.paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {billingData.paymentMethod.expiryMonth}/{billingData.paymentMethod.expiryYear}
                </p>
              </div>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {billingData.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Download invoices and view payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingData.invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount}</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 capitalize">{invoice.status}</span>
                      </div>
                    </div>
                    {invoice.downloadUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={invoice.downloadUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {billingData.invoices.length > 5 && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleManageBilling}
              >
                View All Invoices
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/pricing">
              <TrendingUp className="h-4 w-4 mr-2" />
              View All Plans
            </Link>
          </Button>
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/contact">
              <ExternalLink className="h-4 w-4 mr-2" />
              Contact Billing Support
            </Link>
          </Button>
          {billingData.subscriptionTier !== 'free' && (
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customer Portal
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
