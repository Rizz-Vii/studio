# Tier System Documentation

## Standard Tier Structure

The RankPilot application uses a 4-tier subscription model:

### 1. Free Tier

- **Name**: "free"
- **Price**: $0/month
- **Features**: Basic functionality, limited usage
- **Limits**: 10 keywords, 1 competitor

### 2. Starter Tier

- **Name**: "starter"
- **Price**: $29/month, $290/year
- **Features**: Enhanced functionality for individuals
- **Limits**: 50 keywords, 5 competitors

### 3. Agency Tier

- **Name**: "agency"
- **Price**: $199/month, $1990/year
- **Features**: Professional features for agencies
- **Limits**: Unlimited keywords and competitors

### 4. Enterprise Tier

- **Name**: "enterprise"
- **Price**: $499/month, $4990/year
- **Features**: Full enterprise features
- **Limits**: Everything in Agency plus enterprise features

## Tier Hierarchy

The tiers follow a strict hierarchy for feature access:

```
free < starter < agency < enterprise
```

Users with a higher tier automatically have access to all features of lower tiers.

## Implementation Details

### Type Definitions

```typescript
type SubscriptionTier = "free" | "starter" | "agency" | "enterprise";
```

### Feature Access Control

```typescript
// Check if user can access a feature requiring a specific tier
const canAccess = (userTier: string, requiredTier: string) => {
  const hierarchy = ["free", "starter", "agency", "enterprise"];
  const userIndex = hierarchy.indexOf(userTier);
  const requiredIndex = hierarchy.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};
```

### Database Schema

User documents in Firestore should have:

```typescript
interface UserSubscription {
  tier: SubscriptionTier; // Primary tier field
  subscriptionTier: SubscriptionTier; // Should match tier field
  subscriptionStatus: "active" | "inactive" | "cancelled";
  // ... other fields
}
```

## Migration Notes

- Legacy tier names (`professional`, `premium`, etc.) have been migrated
- All components now use the standard 4-tier system
- Database consistency is enforced through migration scripts

## Updated: 2025-07-20T17:11:48.323Z
