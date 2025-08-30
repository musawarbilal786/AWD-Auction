# Stripe Backend Implementation Guide

## 🚨 **IMPORTANT: Security Issue Fixed**

The previous implementation was trying to call a non-existent custom API endpoint. We've now updated it to call your backend, which will then use the Stripe SDK to create customers.

## 🔒 **Why Frontend Can't Call Stripe Directly**

- **Secret Key Exposure**: Frontend code is visible to users, so secret keys would be exposed
- **Security Risk**: Anyone could create customers on your behalf
- **PCI Compliance**: Stripe requires server-side processing for security

## 🏗️ **Required Backend Implementation**

### 1. **Install Stripe SDK (Backend)**

```bash
# For Node.js/Express
npm install stripe

# For Python/Django
pip install stripe

# For PHP
composer require stripe/stripe-php
```

### 2. **Backend API Endpoints Required**

Your backend needs these endpoints:

```
POST /api/stripe/customers/          # Create customer
GET /api/stripe/customers/{id}/      # Get customer
PATCH /api/stripe/customers/{id}/    # Update customer
DELETE /api/stripe/customers/{id}/   # Delete customer
POST /api/stripe/customers/{id}/payment-methods/  # Attach payment method
GET /api/stripe/customers/{id}/payment-methods/   # Get payment methods
POST /api/stripe/payment-intents/    # Create payment intent
```

### 3. **Node.js/Express Implementation Example**

```javascript
// server.js or app.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create Stripe customer
app.post('/api/stripe/customers', async (req, res) => {
  try {
    const { email, name, phone, address, metadata, stripe_mode } = req.body;
    
    // Use test or live mode based on request
    const stripeInstance = stripe_mode === 'live' 
      ? require('stripe')(process.env.STRIPE_LIVE_SECRET_KEY)
      : require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
    
    const customer = await stripeInstance.customers.create({
      email,
      name,
      phone,
      address,
      metadata,
    });
    
    res.json(customer);
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get customer by ID
app.get('/api/stripe/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await stripe.customers.retrieve(id);
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
app.patch('/api/stripe/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await stripe.customers.update(id, req.body);
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
app.delete('/api/stripe/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await stripe.customers.del(id);
    res.json({ deleted: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Attach payment method to customer
app.post('/api/stripe/customers/:id/payment-methods', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, card, billing_details } = req.body;
    
    const paymentMethod = await stripe.paymentMethods.attach(card.token, {
      customer: id,
    });
    
    res.json(paymentMethod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get customer payment methods
app.get('/api/stripe/customers/:id/payment-methods', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: id,
      type: 'card',
    });
    
    res.json(paymentMethods.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create payment intent
app.post('/api/stripe/payment-intents', async (req, res) => {
  try {
    const { amount, currency, customer, stripe_mode } = req.body;
    
    const stripeInstance = stripe_mode === 'live' 
      ? require('stripe')(process.env.STRIPE_LIVE_SECRET_KEY)
      : require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
    
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency,
      customer,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json(paymentIntent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### 4. **Python/Django Implementation Example**

```python
# views.py
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
def create_customer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Use test or live mode
            if data.get('stripe_mode') == 'live':
                stripe.api_key = settings.STRIPE_LIVE_SECRET_KEY
            else:
                stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
            
            customer = stripe.Customer.create(
                email=data['email'],
                name=data['name'],
                phone=data.get('phone'),
                address=data.get('address'),
                metadata=data.get('metadata', {})
            )
            
            return JsonResponse(customer)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def get_customer(request, customer_id):
    try:
        customer = stripe.Customer.retrieve(customer_id)
        return JsonResponse(customer)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def update_customer(request, customer_id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            customer = stripe.Customer.modify(customer_id, **data)
            return JsonResponse(customer)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def delete_customer(request, customer_id):
    if request.method == 'DELETE':
        try:
            customer = stripe.Customer.delete(customer_id)
            return JsonResponse({'deleted': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def attach_payment_method(request, customer_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_method = stripe.PaymentMethod.attach(
                data['card']['token'],
                customer=customer_id
            )
            return JsonResponse(payment_method)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def get_payment_methods(request, customer_id):
    try:
        payment_methods = stripe.PaymentMethod.list(
            customer=customer_id,
            type='card'
        )
        return JsonResponse({'data': payment_methods.data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def create_payment_intent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            if data.get('stripe_mode') == 'live':
                stripe.api_key = settings.STRIPE_LIVE_SECRET_KEY
            else:
                stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
            
            payment_intent = stripe.PaymentIntent.create(
                amount=data['amount'],
                currency=data['currency'],
                customer=data.get('customer'),
                automatic_payment_methods={'enabled': True}
            )
            
            return JsonResponse(payment_intent)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
```

### 5. **Environment Variables (Backend)**

```env
# Test Mode
STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key_here

# Live Mode (when ready)
STRIPE_LIVE_SECRET_KEY=sk_live_your_live_secret_key_here

# Mode
STRIPE_LIVE_MODE=false
```

## 🔄 **Updated Frontend Flow**

1. **User fills form** → Card details collected
2. **Frontend calls** → `POST /api/stripe/customers/` (your backend)
3. **Backend creates** → Stripe customer using Stripe SDK
4. **Backend returns** → Customer ID and details
5. **Frontend shows** → Success message

## 🧪 **Testing**

### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expired**: `4000 0000 0000 0069`

### Test the Flow:
1. Complete registration
2. Click "Connect to Stripe"
3. Fill card details
4. Submit form
5. Check your backend logs
6. Verify customer creation in Stripe Dashboard

## 🚀 **Next Steps**

1. **Implement backend endpoints** using the examples above
2. **Test with test keys** first
3. **Verify customer creation** in Stripe Dashboard
4. **Switch to live mode** when ready for production

## 📞 **Support**

- **Stripe Documentation**: https://stripe.com/docs/api/customers
- **Stripe Dashboard**: https://dashboard.stripe.com/test/customers
- **Backend Issues**: Check your server logs and Stripe Dashboard

The frontend is now properly configured to work with your backend. You just need to implement these backend endpoints using the Stripe SDK!
