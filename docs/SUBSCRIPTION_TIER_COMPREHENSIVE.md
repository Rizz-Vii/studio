# RankPilot Subscription & Tier System

## Overview

RankPilot implements a 5-tier subscription model that provides different levels of functionality based on user subscription status. This document provides a comprehensive overview of the tier system implementation, standardization, and related fixes.

## Standard Tier Structure

| Tier | Description | Primary Use Case |
|------|-------------|------------------|
| Free | Basic access with limited features | New users, evaluation |
| Starter | Entry-level paid tier with essential features | Individuals, small blogs |
| Agency | Enhanced capabilities for professional users | Marketing agencies, mid-size businesses |
| Enterprise | Full feature set with advanced capabilities | Large organizations, enterprises |
| Admin | Complete system access | RankPilot team only |

### 1. Free Tier

- **Name**: "free"
- **Price**: $0/month
- **Features**: Basic functionality, limited usage
- **Limits**: 10 keywords, 1 competitor
- **NeuroSEO™ Access**: Basic features only

### 2. Starter Tier

- **Name**: "starter" 
- **Price**: $29/month, $290/year
- **Features**: Enhanced functionality for individuals
- **Limits**: 50 keywords, 5 competitors
- **NeuroSEO™ Access**: Basic features

### 3. Agency Tier

- **Name**: "agency"
- **Price**: $199/month, $1990/year
- **Features**: Professional features for agencies
- **Limits**: Unlimited keywords and competitors
- **NeuroSEO™ Access**: Advanced features

### 4. Enterprise Tier

- **Name**: "enterprise"
- **Price**: $499/month, $4990/year
- **Features**: Full enterprise features
- **Limits**: Everything in Agency plus enterprise features
- **NeuroSEO™ Access**: Unlimited usage

### 5. Admin Tier

- **Name**: "admin"
- **Internal Use**: RankPilot team only
- **Features**: Complete system access
- **NeuroSEO™ Access**: All features + system configuration

## Tier Hierarchy & Feature Inheritance

The tiers follow a strict hierarchy for feature access:

```
free < starter < agency < enterprise < admin
```

Users with a higher tier automatically have access to all features of lower tiers. This is implemented through the tier hierarchy pattern:

```typescript
// Tier hierarchy with feature inheritance
const tierHierarchy = {
  free: ["dashboard", "keyword-tool"],
  starter: [...free, "content-analyzer", "neuroseo-basic"],
  agency: [...starter, "competitors", "neuroseo-advanced"],
  enterprise: [...agency, "adminonly", "unlimited-neuroseo"],
  admin: [...enterprise, "user-management", "system-admin"],
};
```

## Implementation Details

### Type Definitions

```typescript
type SubscriptionTier = "free" | "starter" | "agency" | "enterprise" | "admin";

interface UserSubscription {
  tier: SubscriptionTier;
  status: "active" | "canceled" | "pastDue" | "trial";
  startDate: number; // Unix timestamp
  endDate: number | null; // Unix timestamp or null for ongoing
  paymentHistory: PaymentRecord[];
}

interface PaymentRecord {
  amount: number;
  date: number; // Unix timestamp
  method: "stripe" | "paypal" | "manual" | "free";
  status: "success" | "failed" | "refunded";
}
```

### Tier Constants

We've created a centralized tier constants file that serves as the single source of truth:

```typescript
// src/lib/constants/tier-constants.ts
export const TIERS = {
  FREE: "free",
  STARTER: "starter",
  AGENCY: "agency", 
  ENTERPRISE: "enterprise",
  ADMIN: "admin"
};

export const TIER_LABELS = {
  [TIERS.FREE]: "Free",
  [TIERS.STARTER]: "Starter",
  [TIERS.AGENCY]: "Agency",
  [TIERS.ENTERPRISE]: "Enterprise",
  [TIERS.ADMIN]: "Admin"
};

// Ordered array of tiers from lowest to highest
export const TIER_HIERARCHY = [
  TIERS.FREE,
  TIERS.STARTER, 
  TIERS.AGENCY,
  TIERS.ENTERPRISE,
  TIERS.ADMIN
];

// Feature access matrix
export const TIER_FEATURES = {
  [TIERS.FREE]: ["dashboard", "keyword-tool", "neuroseo-basic"],
  [TIERS.STARTER]: ["content-analyzer", "neuroseo-standard"],
  [TIERS.AGENCY]: ["competitor-analysis", "neuroseo-advanced"],
  [TIERS.ENTERPRISE]: ["white-label", "api-access", "unlimited-neuroseo"],
  [TIERS.ADMIN]: ["user-management", "system-settings"]
};
```

## Access Control System

### Feature Gate Component

We use a FeatureGate component to restrict access to features based on subscription tier:

```tsx
// src/components/ui/feature-gate.tsx
import { useSubscription } from "@/hooks/use-subscription";
import { TIER_HIERARCHY, TIERS } from "@/lib/constants/tier-constants";

interface FeatureGateProps {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ 
  requiredTier, 
  children, 
  fallback 
}: FeatureGateProps) => {
  const { tier } = useSubscription();
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  const userIndex = TIER_HIERARCHY.indexOf(tier);

  if (userIndex >= requiredIndex) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
};
```

### Route Protection

```typescript
// src/lib/auth/protect-route.ts
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/lib/services/subscription-service";

export async function protectRoute(
  requiredTier: SubscriptionTier,
  redirectPath = "/upgrade"
) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const subscription = await getUserSubscription(user.uid);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  const userIndex = TIER_HIERARCHY.indexOf(subscription.tier);
  
  if (userIndex < requiredIndex) {
    redirect(redirectPath);
  }
}
```

## Subscription Service

We've implemented a centralized subscription service that is the single source of truth for all subscription-related operations:

```typescript
// src/lib/services/subscription-service.ts
import { db } from "@/lib/firebase/firestore";

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const doc = await db.collection("users").doc(userId).get();
  const userData = doc.data();
  
  if (!userData || !userData.subscription) {
    return getDefaultSubscription();
  }
  
  return userData.subscription;
}

export async function updateUserSubscription(
  userId: string, 
  subscription: Partial<UserSubscription>
): Promise<void> {
  return db.collection("users").doc(userId).update({
    subscription: subscription
  });
}

// Additional functions for subscription management
```

## Recent Fixes & Improvements

### 1. Automatic User Subscription Sync ✅

- **File**: `src/lib/user-subscription-sync.ts`
- **Function**: `ensureUserSubscription()`
- **Integration**: Added to `AuthContext.tsx` to run on every login
- **Behavior**: Automatically creates proper subscription data when a user logs in

### 2. Admin Management Tools ✅

- **File**: `src/lib/admin-user-management.ts`
- **Functions**: `adminUpdateUserSubscription()`, `fixAllTestUsers()`
- **Interface**: `src/components/admin/AdminUserSubscriptionManager.tsx`
- **Access**: Available in Admin Dashboard → Subscriptions tab

### 3. Debug Tools ✅

- **File**: `src/components/debug/UserSubscriptionDebugger.tsx`
- **Page**: `/debug` - Shows detailed subscription info for current user
- **Features**: Real-time subscription status, UID tracking, raw data inspection

### 4. UID Consistency Fix ✅

- **Problem**: Hardcoded UIDs in test data causing subscription mismatches
- **Solution**: Updated all subscription checks to use Firebase Authentication UIDs
- **Implementation**: Enhanced subscription service to handle edge cases

## Best Practices

1. **Always Use Constants** - Never hardcode tier names, use `TIERS.AGENCY` instead of `"agency"`
2. **Check Access Properly** - Use the hierarchy comparison instead of direct equality checks
3. **Route Protection** - Always protect routes at the page level using `protectRoute`
4. **Feature Gating** - Use `<FeatureGate>` for conditional UI elements
5. **Graceful Degradation** - Show meaningful upgrade prompts instead of errors or empty states
