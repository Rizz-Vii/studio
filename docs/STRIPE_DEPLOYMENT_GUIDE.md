# Stripe Integration Deployment Guide

## Overview
This guide walks you through setting up Stripe integration for RankPilot in production.

## 1. Stripe Dashboard Setup

### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Switch to live mode for production

### Create Products and Prices
Create the following products in your Stripe Dashboard:


#### Starter Plan
- **Product Name**: RankPilot Starter
- **Description**: Perfect for small businesses getting started with SEO
- **Pricing**: $29/month or $290/year
- **Billing**: Recurring

#### Agency Plan
- **Product Name**: RankPilot Agency
- **Description**: Full-featured solution for agencies and large teams
- **Pricing**: $199/month or $1990/year
- **Billing**: Recurring

### Update Price IDs
After creating products, update the price IDs in `src/lib/stripe.ts`:

```typescript
export const STRIPE_PLANS = {
  starter: {
    monthly: "price_XXXXXXXXXXXXXXXX", // Replace with actual price ID
    yearly: "price_XXXXXXXXXXXXXXXX",  // Replace with actual price ID
    // ... rest of config
  },
  // ... other plans
};
```

## 2. Environment Variables

### Firebase Secret Manager
Set the following secrets in Firebase:

```bash
# Stripe Configuration
firebase functions:secrets:set STRIPE_SECRET_KEY="sk_live_..." # Live secret key
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET="whsec_..." # Webhook secret

# Test keys for development
firebase functions:secrets:set STRIPE_SECRET_KEY_TEST="sk_test_..." # Test secret key
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET_TEST="whsec_..." # Test webhook secret
```

### Local Development (.env.local)
```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production values
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
```

## 3. Webhook Configuration

### Create Webhook Endpoint
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Update Firebase Functions
Ensure your Firebase function is deployed:
```bash
firebase deploy --only functions:stripeWebhook
```

## 4. Firebase Configuration

### Update firebase.json
The configuration should include:
```json
{
  "functions": {
    "secrets": [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET"
    ]
  }
}
```

### Deploy Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 5. Security Configuration

### Content Security Policy
Update CSP headers in `firebase.json` to include Stripe domains:
```json
{
  "key": "Content-Security-Policy",
  "value": "...; script-src 'self' https://js.stripe.com; connect-src 'self' https://api.stripe.com;"
}
```

### Firestore Security Rules
Update Firestore rules to protect subscription data:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own subscription data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subscription data is read-only from client
      match /subscription/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only backend functions can write
      }
    }
  }
}
```

## 6. Testing

### Test Mode Setup
1. Use Stripe test card numbers:
   - Success: `4242424242424242`
   - Declined: `4000000000000002`
   - 3D Secure: `4000002500003155`

### Test Scenarios
- [ ] Successful checkout flow
- [ ] Failed payment handling
- [ ] Subscription cancellation
- [ ] Webhook processing
- [ ] Customer portal access

### Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook
```

## 7. Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables set
- [ ] Stripe products and prices created
- [ ] Webhook endpoints configured
- [ ] Firebase functions deployed
- [ ] Security rules updated
- [ ] CSP headers configured

### Deployment Steps
1. Update price IDs in production code
2. Deploy to Firebase Hosting:
   ```bash
   npm run build
   firebase deploy
   ```
3. Verify webhook endpoints are receiving events
4. Test complete payment flow

### Post-deployment Verification
- [ ] Checkout flow works end-to-end
- [ ] Webhooks are processing correctly
- [ ] Subscription status updates in real-time
- [ ] Customer portal functions properly
- [ ] Email notifications are sent

## 8. Monitoring and Maintenance

### Stripe Dashboard Monitoring
Monitor these metrics:
- Payment success rate
- Failed payment notifications
- Subscription churn rate
- Revenue tracking

### Firebase Monitoring
- Function execution logs
- Error rates and alerts
- Database usage and costs

### User Experience Monitoring
- Checkout abandonment rate
- Time to complete purchase
- Customer support tickets

## 9. Troubleshooting

### Common Issues
1. **Webhook signature verification fails**
   - Check webhook secret in environment
   - Verify raw body is passed to verification

2. **Price IDs not found**
   - Confirm price IDs match Stripe Dashboard
   - Check test vs live mode consistency

3. **Function deployment fails**
   - Verify all required secrets are set
   - Check Node.js version compatibility

### Debug Commands
```bash
# Check function logs
firebase functions:log

# Test webhook locally
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook

# Verify environment
firebase functions:secrets:access STRIPE_SECRET_KEY
```

## 10. Support and Resources

### Documentation
- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Next.js Stripe Guide](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements)

### Support Channels
- Stripe Support: Dashboard > Help & Support
- Firebase Support: Firebase Console > Support
- Community: Stack Overflow, Discord

---

## Quick Start Checklist

For a rapid deployment, follow this condensed checklist:

1. **Stripe Setup** (30 mins)
   - [ ] Create account and verify
   - [ ] Create 3 products with monthly/yearly pricing
   - [ ] Copy price IDs to `src/lib/stripe.ts`
   - [ ] Create webhook endpoint

2. **Environment Configuration** (15 mins)
   - [ ] Set Firebase secrets for Stripe keys
   - [ ] Update local `.env.local` file
   - [ ] Add webhook secret

3. **Deploy** (10 mins)
   - [ ] Deploy Firebase functions
   - [ ] Deploy Next.js app
   - [ ] Test checkout flow

4. **Verify** (15 mins)
   - [ ] Complete test purchase
   - [ ] Check webhook logs
   - [ ] Verify subscription creation

**Total Setup Time: ~70 minutes**

Your Stripe integration should now be live and processing payments!
