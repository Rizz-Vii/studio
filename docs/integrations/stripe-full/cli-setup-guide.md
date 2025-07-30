# 🚀 RankPilot Stripe CLI Setup & Webhook Testing Guide

**Generated:** July 29, 2025  
**Status:** ✅ READY - Webhook secret configured  
**Price ID:** `price_1RqFwc2fkoCQ0GTp8wygbgXh` ✅ ACTIVE

## 📋 **Stripe CLI Installation & Setup**

### **Step 1: Install Stripe CLI**

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Linux (Ubuntu/Debian):**

```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
```

**Windows (Download):**

- Download from: https://github.com/stripe/stripe-cli/releases
- Extract and add to PATH

### **Step 2: Authenticate with Stripe**

```bash
# Login to your Stripe account
stripe login
```

**Follow the browser authentication flow and return to terminal**

### **Step 3: Start Webhook Forwarding for RankPilot**

```bash
# Forward webhooks to RankPilot's webhook endpoint
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Expected Output:**

```
⡿ Getting ready...
✅ Ready! Your webhook signing secret is whsec_uUnLNcs8nTaMTlVOkkLYoMpWLnLzIv7c (^C to quit)
```

## ⚡ **RankPilot Webhook Testing Commands**

### **Test Payment Flow:**

```bash
# Test successful subscription creation
stripe trigger checkout.session.completed

# Test subscription updates  
stripe trigger customer.subscription.updated

# Test payment success
stripe trigger invoice.payment_succeeded

# Test payment failure
stripe trigger invoice.payment_failed

# Test subscription cancellation
stripe trigger customer.subscription.deleted
```

### **Test RankPilot-Specific Events:**

```bash
# Create a test checkout session for Starter tier
stripe checkout sessions create \
  --line-items='[{"price": "price_1RqFwc2fkoCQ0GTp8wygbgXh", "quantity": 1}]' \
  --mode=subscription \
  --success-url="http://localhost:3000/dashboard?success=true" \
  --cancel-url="http://localhost:3000/pricing"

# Test subscription with trial period
stripe checkout sessions create \
  --line-items='[{"price": "price_1RqFwc2fkoCQ0GTp8wygbgXh", "quantity": 1}]' \
  --mode=subscription \
  --subscription-data='{"trial_period_days": 14}' \
  --success-url="http://localhost:3000/dashboard?trial=true" \
  --cancel-url="http://localhost:3000/pricing"
```

## 🔧 **Development Workflow**

### **Terminal 1: RankPilot Development Server**

```bash
cd /workspaces/studio
npm run dev-no-turbopack
```

### **Terminal 2: Stripe Webhook Listener**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### **Terminal 3: Event Testing**

```bash
# Test various webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## 📊 **Real-Time Webhook Monitoring**

### **Monitor RankPilot Webhook Events:**

```bash
# View webhook events with detailed output
stripe listen --forward-to localhost:3000/api/stripe/webhook --print-json

# Filter specific events for RankPilot
stripe listen \
  --forward-to localhost:3000/api/stripe/webhook \
  --events checkout.session.completed,customer.subscription.updated,invoice.payment_succeeded
```

### **Test Event Payload:**

```bash
# Create detailed test event
stripe events create \
  --type checkout.session.completed \
  --data '{
    "object": {
      "id": "cs_test_rankpilot",
      "client_reference_id": "user_123",
      "customer": "cus_test_rankpilot",
      "subscription": "sub_test_rankpilot",
      "metadata": {
        "userId": "user_123",
        "tier": "starter",
        "platform": "rankpilot"
      }
    }
  }'
```

## 🎯 **Production Webhook Setup**

### **When deploying to production:**

1. **Create Production Webhook Endpoint:**

```bash
# Add webhook endpoint in Stripe Dashboard
https://your-domain.com/api/stripe/webhook
```

2. **Configure Webhook Events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

3. **Update Environment Variables:**

```bash
# Production webhook secret (different from CLI)
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

## 🚀 **Complete RankPilot Payment Test Sequence**

### **1. Start All Services:**

```bash
# Terminal 1: Development server
npm run dev-no-turbopack

# Terminal 2: Webhook listener  
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Ready for testing
```

### **2. Test Payment Flow:**

```bash
# Create test checkout session
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "starter",
    "successUrl": "http://localhost:3000/dashboard?success=true",
    "cancelUrl": "http://localhost:3000/pricing"
  }'
```

### **3. Simulate Webhook Events:**

```bash
# Trigger subscription completion
stripe trigger checkout.session.completed

# Check RankPilot webhook handler logs
curl http://localhost:3000/api/stripe/webhook/test
```

## 📋 **Webhook Secret Configuration Status**

✅ **Current Configuration:**

- **Webhook Secret:** `whsec_uUnLNcs8nTaMTlVOkkLYoMpWLnLzIv7c`
- **Environment:** Development (Stripe CLI)
- **Endpoint:** `http://localhost:3000/api/stripe/webhook`
- **Status:** Active and ready for testing

✅ **Price Configuration:**

- **Starter Tier Price ID:** `price_1RqFwc2fkoCQ0GTp8wygbgXh`
- **Amount:** A$29.00/month
- **Status:** Active in Stripe Dashboard

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Webhook not receiving events:**

```bash
# Check if CLI is running
stripe listen --forward-to localhost:3000/api/stripe/webhook --log-level debug
```

2. **Invalid signature errors:**

```bash
# Verify webhook secret matches
echo $STRIPE_WEBHOOK_SECRET
```

3. **Port conflicts:**

```bash
# Use different port if needed
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

---

**✅ STRIPE CLI & WEBHOOKS CONFIGURED**  
RankPilot is ready for live payment testing with real Stripe events!

🎉 **Test the complete payment flow: Stripe CLI → RankPilot → Webhook → Database update!**
