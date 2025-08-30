# Stripe Integration for AWD Auction

This document describes the Stripe integration implemented for customer creation and payment method setup after user registration.

## 🚀 Features

- **Customer Creation**: Automatically creates Stripe customers after successful registration
- **Payment Method Setup**: Collects and stores customer payment methods
- **Test Mode Support**: Full test environment with test keys
- **Production Ready**: Easy switch to live mode
- **Secure**: No sensitive data stored in frontend
- **User Friendly**: Step-by-step setup process

## 🔑 Configuration

### Test Environment (Current)
```env
NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY=pk_test_51NYyRFEaPimPIhjgHrqQ69zPKJcrawhGcaP4KD6vNTqsjDgzCucIxwjlh0fIPhq7KqrOtXAIiX1nde5zcN84HNIv00gCZ6R9Du
STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_LIVE_MODE=false
```

### Production Environment
```env
NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY=pk_live_your_live_public_key_here
STRIPE_LIVE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_LIVE_MODE=true
```

## 📁 File Structure

```
src/
├── config/
│   └── stripe.ts                 # Stripe configuration and appearance
├── services/
│   └── api/
│       └── stripe.ts             # Stripe API service
├── components/
│   └── stripe/
│       └── StripeCustomerSetup.tsx # Customer setup component
└── app/
    └── registration/
        └── page.tsx              # Updated registration with Stripe
```

## 🔧 Implementation Details

### 1. Stripe Configuration (`src/config/stripe.ts`)
- Environment-based key selection
- Custom appearance configuration
- Test/Live mode switching

### 2. Stripe Service (`src/services/api/stripe.ts`)
- Customer creation
- Payment method attachment
- Customer management (CRUD operations)
- Payment intent creation

### 3. Customer Setup Component (`src/components/stripe/StripeCustomerSetup.tsx`)
- Two-step process: Customer Info → Payment Method
- Pre-filled forms from registration data
- Real-time validation
- Progress indicators

### 4. Registration Integration (`src/app/registration/page.tsx`)
- Modal-based Stripe setup
- Success status tracking
- Dual button layout (Connect to Stripe + Redirect to Login)

## 🎯 User Flow

1. **User completes registration** → Success message shown
2. **User clicks "Connect to Stripe"** → Modal opens
3. **Step 1: Customer Information** → Pre-filled form, user reviews/updates
4. **Step 2: Payment Method** → Card input with Stripe Elements
5. **Success** → Customer created, payment method attached
6. **Return to registration** → Success status shown, Stripe button hidden

## 🛠️ API Endpoints Required

The integration expects these backend endpoints:

### Customer Management
```
POST /stripe/api/v1/customers/
GET /stripe/api/v1/customers/{id}/
PATCH /stripe/api/v1/customers/{id}/
DELETE /stripe/api/v1/customers/{id}/
```

### Payment Methods
```
POST /stripe/api/v1/customers/{id}/payment-methods/
GET /stripe/api/v1/customers/{id}/payment-methods/
```

### Payment Intents (Future)
```
POST /stripe/api/v1/payment-intents/
```

## 💳 Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`
- **Incorrect CVC**: `4000 0000 0000 0127`

**Expiry Date**: Any future date (e.g., `12/25`)
**CVC**: Any 3 digits (e.g., `123`)

## 🔒 Security Features

- **No Secret Keys in Frontend**: Only public keys exposed
- **Token-based Payment**: Card data never touches your servers
- **HTTPS Required**: Stripe Elements only work over HTTPS
- **PCI Compliance**: Stripe handles all PCI requirements

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install @stripe/stripe-js stripe
```

### 2. Set Environment Variables
Create `.env.local` with your Stripe keys:
```env
NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY=pk_test_...
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_LIVE_MODE=false
```

### 3. Backend Setup
Implement the required API endpoints for:
- Customer creation
- Payment method attachment
- Customer management

### 4. Test the Integration
1. Run the registration flow
2. Complete registration
3. Click "Connect to Stripe"
4. Use test card numbers
5. Verify customer creation in Stripe Dashboard

## 🔄 Switching to Production

1. **Update Environment Variables**:
   ```env
   STRIPE_LIVE_MODE=true
   NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY=pk_live_...
   STRIPE_LIVE_SECRET_KEY=sk_live_...
   ```

2. **Update Backend**: Ensure backend uses live keys
3. **Test Thoroughly**: Verify all functionality works in live mode
4. **Monitor**: Use Stripe Dashboard for monitoring

## 📊 Monitoring & Analytics

### Stripe Dashboard
- Customer creation metrics
- Payment method success rates
- Error tracking
- Revenue analytics

### Application Logs
- Customer creation success/failure
- Payment method attachment status
- API response times
- Error details

## 🐛 Troubleshooting

### Common Issues

1. **"Stripe not initialized"**
   - Check public key configuration
   - Verify environment variables

2. **"Card declined"**
   - Use correct test card numbers
   - Check Stripe Dashboard for error details

3. **"API endpoint not found"**
   - Verify backend endpoints are implemented
   - Check API URL configuration

4. **"CORS errors"**
   - Ensure backend allows frontend domain
   - Check API configuration

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('debug', 'stripe');
```

## 🔮 Future Enhancements

- **Webhook Integration**: Real-time payment notifications
- **Subscription Management**: Recurring payments
- **Invoice Generation**: Automated billing
- **Payment Analytics**: Advanced reporting
- **Multi-currency Support**: International payments
- **Apple Pay/Google Pay**: Mobile payment methods

## 📞 Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Development Team**: Contact your development team
- **Issues**: Create issues in project repository

## 📝 Notes

- **Test Mode**: Currently configured for test environment
- **Live Mode**: Requires Stripe account verification
- **Compliance**: Ensure compliance with local payment regulations
- **Backup**: Keep backup of all configuration and keys
- **Updates**: Regularly update Stripe SDK versions
