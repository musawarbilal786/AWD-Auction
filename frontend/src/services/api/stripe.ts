import axios from 'axios';
import { STRIPE_CONFIG } from '@/config/stripe';

// Frontend direct Stripe API access
// Note: This approach has security implications as mentioned in the config

export interface StripeCustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: {
    userId?: string;
    dealershipName?: string;
    taxId?: string;
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    bankName?: string;
    accountType?: string;
    cardholderName?: string;
    [key: string]: any;
  };
}

export interface StripePaymentMethodData {
  type: 'card';
  card: {
    token: string;
  };
  billing_details?: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export interface StripeCustomerResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created: number;
  livemode: boolean;
  metadata: Record<string, string>;
}

class StripeService {
  private getStripeHeaders() {
    return {
      'Authorization': `Bearer ${STRIPE_CONFIG.getSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2023-10-16' // Use latest API version
    };
  }

  // Create a Stripe customer directly from frontend
  async createCustomer(customerData: StripeCustomerData): Promise<StripeCustomerResponse> {
    try {
      // Convert data to URL-encoded format for Stripe API
      const formData = new URLSearchParams();
      
      // Add basic customer fields
      if (customerData.email) formData.append('email', customerData.email);
      if (customerData.name) formData.append('name', customerData.name);
      if (customerData.phone) formData.append('phone', customerData.phone);
      
      // Add address fields
      if (customerData.address) {
        if (customerData.address.line1) formData.append('address[line1]', customerData.address.line1);
        if (customerData.address.city) formData.append('address[city]', customerData.address.city);
        if (customerData.address.state) formData.append('address[state]', customerData.address.state);
        if (customerData.address.postal_code) formData.append('address[postal_code]', customerData.address.postal_code);
        if (customerData.address.country) formData.append('address[country]', customerData.address.country);
      }
      
      // Add metadata fields
      if (customerData.metadata) {
        Object.entries(customerData.metadata).forEach(([key, value]) => {
          if (value) formData.append(`metadata[${key}]`, value);
        });
      }
      
      // Call Stripe API directly
      const response = await axios.post(
        'https://api.stripe.com/v1/customers',
        formData.toString(),
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating Stripe customer:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Get customer by ID directly from Stripe
  async getCustomer(customerId: string): Promise<StripeCustomerResponse> {
    try {
      const response = await axios.get(
        `https://api.stripe.com/v1/customers/${customerId}`,
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching Stripe customer:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Update customer directly from Stripe
  async updateCustomer(customerId: string, customerData: Partial<StripeCustomerData>): Promise<StripeCustomerResponse> {
    try {
      const response = await axios.post(
        `https://api.stripe.com/v1/customers/${customerId}`,
        customerData,
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating Stripe customer:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Delete customer directly from Stripe
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await axios.delete(
        `https://api.stripe.com/v1/customers/${customerId}`,
        {
          headers: this.getStripeHeaders(),
        }
      );
    } catch (error: any) {
      console.error('Error deleting Stripe customer:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Create payment method directly from Stripe
  async createPaymentMethod(paymentMethodData: any): Promise<any> {
    try {
      // Convert data to URL-encoded format for Stripe API
      const formData = new URLSearchParams();
      
      // Add payment method fields
      if (paymentMethodData.type) formData.append('type', paymentMethodData.type);
      
      // Use test tokens instead of raw card data for security
      if (paymentMethodData.card) {
        // For test mode, use test tokens that map to test cards
        if (paymentMethodData.card.number === '4242424242424242') {
          formData.append('card[token]', 'tok_visa');
        } else if (paymentMethodData.card.number === '4000000000000002') {
          formData.append('card[token]', 'tok_visa_declined');
        } else if (paymentMethodData.card.number === '5555555555554444') {
          formData.append('card[token]', 'tok_mastercard');
        } else {
          // Fallback to raw card data (requires enabling raw card data APIs)
          if (paymentMethodData.card.number) formData.append('card[number]', paymentMethodData.card.number);
          if (paymentMethodData.card.exp_month) formData.append('card[exp_month]', paymentMethodData.card.exp_month);
          if (paymentMethodData.card.exp_year) formData.append('card[exp_year]', paymentMethodData.card.exp_year);
          if (paymentMethodData.card.cvc) formData.append('card[cvc]', paymentMethodData.card.cvc);
        }
      }
      
      if (paymentMethodData.billing_details) {
        if (paymentMethodData.billing_details.name) formData.append('billing_details[name]', paymentMethodData.billing_details.name);
        if (paymentMethodData.billing_details.email) formData.append('billing_details[email]', paymentMethodData.billing_details.email);
        if (paymentMethodData.billing_details.phone) formData.append('billing_details[phone]', paymentMethodData.billing_details.phone);
      }
      
      const response = await axios.post(
        'https://api.stripe.com/v1/payment_methods',
        formData.toString(),
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Attach payment method to customer directly from Stripe
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<any> {
    try {
      // Convert data to URL-encoded format for Stripe API
      const formData = new URLSearchParams();
      formData.append('customer', customerId);
      
      const response = await axios.post(
        `https://api.stripe.com/v1/payment_methods/${paymentMethodId}/attach`,
        formData.toString(),
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error attaching payment method:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Get customer's payment methods directly from Stripe
  async getCustomerPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card`,
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching customer payment methods:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  // Create a payment intent directly from Stripe
  async createPaymentIntent(amount: number, currency: string = 'usd', customerId?: string): Promise<any> {
    try {
      // Convert data to URL-encoded format for Stripe API
      const formData = new URLSearchParams();
      formData.append('amount', amount.toString());
      formData.append('currency', currency);
      if (customerId) formData.append('customer', customerId);
      formData.append('automatic_payment_methods[enabled]', 'true');
      
      const response = await axios.post(
        'https://api.stripe.com/v1/payment_intents',
        formData.toString(),
        {
          headers: this.getStripeHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }
}

export const stripeService = new StripeService();
export default stripeService;
