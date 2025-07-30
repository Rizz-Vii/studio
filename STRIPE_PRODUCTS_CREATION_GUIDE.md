# 🚀 Stripe Products Creation Guide - Agency & Enterprise Tiers

## 📋 Overview

This script creates Stripe products and price IDs for RankPilot's Agency ($99 AUD) and Enterprise ($299 AUD) subscription tiers.

## 🎯 What Gets Created

### Agency Tier ($99 AUD/month)

- **Product**: RankPilot Agency
- **Features**: 
  - 500 NeuroSEO™ queries per month
  - 25 competitor analysis slots
  - 5 team members
  - Priority email support
  - Advanced AI visibility tracking
  - Custom SEO reports
  - White-label options

### Enterprise Tier ($299 AUD/month)

- **Product**: RankPilot Enterprise
- **Features**:
  - Unlimited NeuroSEO™ queries
  - Unlimited competitor tracking
  - Unlimited team members
  - Dedicated account manager
  - Custom AI model training
  - API access & integrations
  - SLA guarantee
  - Custom deployment options

## 🚀 Usage Commands

### Run the Script

```bash
# Create both products and prices
node scripts/create-stripe-products.js

# Dry run (see what would be created)
node scripts/create-stripe-products.js --dry-run

# Show help
node scripts/create-stripe-products.js --help
```

### Prerequisites

```bash
# Ensure environment is loaded
source .env.local

# Verify Stripe CLI is available (optional for testing)
stripe --version
```

## 📝 Script Output

The script will generate:

1. **Stripe Products**: Complete product definitions with features and metadata
2. **Stripe Prices**: Monthly recurring prices in AUD currency
3. **TypeScript Updates**: Code snippets to update `subscription-management.ts`
4. **Environment Variables**: New price IDs for `.env.local`
5. **Test Commands**: Stripe CLI commands to test the new products

## 🔧 Post-Creation Steps

### 1. Update TypeScript Configuration

Copy the generated code snippets into:

```typescript
// src/lib/stripe/subscription-management.ts
export const RANKPILOT_TIERS = {
    // ... existing tiers
    agency: {
        name: 'Agency Tier',
        price: 99,
        priceId: 'price_GENERATED_ID_HERE', // ← Replace with real ID
        features: { /* ... */ }
    },
    enterprise: {
        name: 'Enterprise Tier', 
        price: 299,
        priceId: 'price_GENERATED_ID_HERE', // ← Replace with real ID
        features: { /* ... */ }
    }
};
```

### 2. Update Environment Variables

Add to `.env.local`:

```bash
STRIPE_PRICE_AGENCY=price_GENERATED_AGENCY_ID
STRIPE_PRICE_ENTERPRISE=price_GENERATED_ENTERPRISE_ID
```

### 3. Test the New Products

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test Agency tier checkout
stripe checkout sessions create \
  --success-url="http://localhost:3000/success" \
  --cancel-url="http://localhost:3000/cancel" \
  --mode=subscription \
  --line-items="price=AGENCY_PRICE_ID,quantity=1"

# Test Enterprise tier checkout  
stripe checkout sessions create \
  --success-url="http://localhost:3000/success" \
  --cancel-url="http://localhost:3000/cancel" \
  --mode=subscription \
  --line-items="price=ENTERPRISE_PRICE_ID,quantity=1"
```

## 🔍 Verification Steps

### 1. Check Stripe Dashboard

- Navigate to Products section
- Verify both "RankPilot Agency" and "RankPilot Enterprise" products exist
- Confirm prices are set to $99 and $299 AUD respectively

### 2. Test API Connectivity

```bash
# Test the integration
./scripts/test-stripe-integration.sh
```

### 3. Validate Pricing Table

- Visit: `http://localhost:3000/pricing`
- Verify all three tiers display correctly
- Test checkout flows for each tier

## 🛡️ Security & Best Practices

### Environment Safety

- Script uses test API keys by default
- Includes safety check for live mode
- Validates Stripe connection before creating products

### Metadata Tracking

- All products include comprehensive metadata
- Creation timestamps and script attribution
- Tier-specific feature tracking

### Error Handling

- Comprehensive error messages
- Rollback guidance if needed
- Detailed logging throughout process

## 🎯 Expected Results

After running the script successfully:

✅ **2 New Stripe Products** created with full feature descriptions
✅ **2 New Price IDs** generated for monthly AUD subscriptions  
✅ **TypeScript Configuration** ready for copy-paste updates
✅ **Environment Variables** ready for `.env.local` updates
✅ **Test Commands** ready for CLI validation
✅ **Complete Documentation** for integration steps

## 🚨 Troubleshooting

### Common Issues

**Script fails with API error:**

```bash
# Check API key is loaded
echo $STRIPE_SECRET_KEY

# Verify Stripe account access
stripe account get
```

**Products already exist:**

- Check Stripe dashboard for existing products
- Delete conflicting products or modify script names
- Use different product names in script configuration

**TypeScript compilation errors:**

- Ensure all price IDs are properly quoted strings
- Verify tier configuration matches exactly
- Run TypeScript check: `npm run type-check`

## 🎉 Success Indicators

When complete, you'll have:

- ✅ Real Stripe Price IDs for Agency and Enterprise tiers
- ✅ Updated TypeScript configuration with production Price IDs
- ✅ Complete 3-tier subscription system (Starter/Agency/Enterprise)
- ✅ CLI testing commands for all subscription flows
- ✅ Production-ready payment system for all RankPilot tiers
