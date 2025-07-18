# Firebase Deployment Fix Guide

## Issue
The Firebase deployment is failing because the Secret Manager doesn't have the required Stripe secrets:
- `STRIPE_SECRET_KEY` 
- `STRIPE_WEBHOOK_SECRET`

## Immediate Fix Options

### Option 1: Add Stripe Secrets to GitHub Repository (Recommended)

1. **Get your Stripe keys:**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Go to Developers > API keys
   - Copy your Secret key (starts with `sk_test_` for test mode)
   - Go to Developers > Webhooks > Add endpoint
   - Create webhook endpoint and copy the signing secret (starts with `whsec_`)

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret

3. **Deploy:**
   - Push your changes or manually trigger deployment
   - The workflow will now include the Stripe secrets

### Option 2: Temporarily Disable Stripe for Deployment

If you don't need Stripe functionality immediately, you can temporarily remove the Stripe secrets from the Firebase configuration:

1. **Edit `firebase.json`:**
   ```json
   "secrets": [
     "GEMINI_API_KEY", 
     "GOOGLE_API_KEY", 
     "OPENAI_API_KEY",
     "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
     "RECAPTCHA_SECRET_KEY"
   ]
   ```

2. **Comment out Stripe functions:**
   - Temporarily disable the Stripe-related functions in `functions/src/index.ts`

3. **Deploy and add Stripe later:**
   - Deploy successfully without Stripe
   - Add Stripe secrets later when ready

### Option 3: Set up Firebase Secret Manager Manually

Run the setup script we created:

```bash
# Make sure you're authenticated
firebase login
gcloud auth login

# Run the setup script
npx ts-node scripts/setup-firebase-secrets.ts
```

This script will guide you through setting up all required secrets in Firebase Secret Manager.

## Current Status

✅ **Fixed GitHub Actions workflows** - Now include Stripe secrets
✅ **Created setup script** - `scripts/setup-firebase-secrets.ts`
⚠️ **Missing GitHub Secrets** - Need to add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

## Next Steps

1. **Choose an option above** based on your immediate needs
2. **Add GitHub repository secrets** for the Stripe keys
3. **Re-run the deployment** (push to trigger workflow)
4. **Test payment functionality** once deployed

## Alternative: Quick Fix for Current Deployment

If you want to deploy immediately without setting up Stripe, temporarily remove Stripe secrets from `firebase.json`:

```bash
# Quick edit firebase.json to remove Stripe secrets temporarily
sed -i '/STRIPE_SECRET_KEY/d' firebase.json
sed -i '/STRIPE_WEBHOOK_SECRET/d' firebase.json
```

Then push and deploy. Add Stripe back later when ready.
