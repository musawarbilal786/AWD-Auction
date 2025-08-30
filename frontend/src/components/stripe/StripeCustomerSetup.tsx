"use client";

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Spin, Alert, Divider, Row, Col } from 'antd';
import { CreditCardOutlined, UserOutlined, PhoneOutlined, HomeOutlined, BankOutlined } from '@ant-design/icons';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/config/stripe';
import { stripeService, StripeCustomerData } from '@/services/api/stripe';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

const { Option } = Select;

interface StripeCustomerSetupProps {
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    dealership_name?: string;
    street_name?: string;
    city_name?: string;
    state_id?: string;
    zipcode?: string;
    tax_id?: string;
  };
  onSuccess: (customerId: string) => void;
  onCancel: () => void;
}

// Main component
const StripeCustomerSetup: React.FC<StripeCustomerSetupProps> = ({ userData, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    // Initialize Stripe
    const initStripe = async () => {
      const stripeInstance = await loadStripe(STRIPE_CONFIG.getPublicKey());
      setStripe(stripeInstance);
    };
    initStripe();
  }, []);

  // Pre-fill form with user data
  useEffect(() => {
    form.setFieldsValue({
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone_number,
      company: userData.dealership_name,
      address: userData.street_name,
      city: userData.city_name,
      state: userData.state_id,
      zipcode: userData.zipcode,
      tax_id: userData.tax_id,
    });
  }, [userData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Create customer data with card information
      const customerData: StripeCustomerData = {
        email: values.email,
        name: `${values.first_name} ${values.last_name}`,
        phone: values.phone,
        address: {
          line1: values.address || '',
          city: values.city || '',
          state: values.state || '',
          postal_code: values.zipcode || '',
          country: 'US',
        },
        metadata: {
          firstName: values.first_name,
          lastName: values.last_name,
          company: values.company,
          taxId: values.tax_id,
          // Card details stored in metadata for reference
          cardLast4: values.card_number ? values.card_number.slice(-4) : '',
          cardBrand: values.card_brand || '',
          cardExpiry: values.card_expiry || '',
          bankName: values.bank_name || '',
          accountType: values.account_type || '',
          cardholderName: values.card_holder_name || '',
        },
      };

      // Create Stripe customer
      const customer = await stripeService.createCustomer(customerData);
      
      // Create and attach payment method
      if (values.card_number && values.card_expiry && values.card_cvc) {
        try {
          // Parse expiry date (format: MM/YY)
          const [expMonth, expYear] = values.card_expiry.split('/');
          const fullYear = `20${expYear}`;
          
          const paymentMethodData = {
            type: 'card',
            card: {
              number: values.card_number.replace(/\s/g, ''), // Remove spaces
              exp_month: parseInt(expMonth),
              exp_year: parseInt(fullYear),
              cvc: values.card_cvc,
            },
            billing_details: {
              name: values.card_holder_name || `${values.first_name} ${values.last_name}`,
              email: values.email,
              phone: values.phone,
            },
          };
          
          // Create payment method
          const paymentMethod = await stripeService.createPaymentMethod(paymentMethodData);
          
          // Attach payment method to customer
          await stripeService.attachPaymentMethod(paymentMethod.id, customer.id);
          
          showSuccessToast('Stripe customer and payment method created successfully!');
        } catch (paymentError: any) {
          console.error('Payment method creation failed:', paymentError);
          showErrorToast(paymentError, 'Payment Method Creation');
          // Still show success for customer creation
          showSuccessToast('Stripe customer created successfully, but payment method failed.');
        }
      } else {
        showSuccessToast('Stripe customer created successfully!');
      }
      
      // Call success callback with customer ID
      onSuccess(customer.id);
      
    } catch (error: any) {
      showErrorToast(error, 'Customer Creation');
    } finally {
      setLoading(false);
    }
  };

  if (!stripe) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Initializing Stripe...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">💳</div>
          <h2 className="text-2xl font-bold text-sky-600 mb-2">
            Complete Your Stripe Profile
          </h2>
          <p className="text-gray-600">
            Set up your Stripe customer account and provide card information for future payments
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserOutlined className="mr-2 text-sky-600" />
              Personal Information
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: 'First name is required' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First Name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: 'Last name is required' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input type="email" placeholder="Email Address" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Phone number is required' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
            </Form.Item>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <HomeOutlined className="mr-2 text-sky-600" />
              Company Information
            </h3>
            
            <Form.Item
              name="company"
              label="Company Name"
            >
              <Input placeholder="Company Name (Optional)" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Address is required' }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="Street Address" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'City is required' }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: 'State is required' }]}
                >
                  <Select placeholder="Select State">
                    <Option value="AL">Alabama</Option>
                    <Option value="AK">Alaska</Option>
                    <Option value="AZ">Arizona</Option>
                    <Option value="AR">Arkansas</Option>
                    <Option value="CA">California</Option>
                    <Option value="CO">Colorado</Option>
                    <Option value="CT">Connecticut</Option>
                    <Option value="DE">Delaware</Option>
                    <Option value="FL">Florida</Option>
                    <Option value="GA">Georgia</Option>
                    <Option value="HI">Hawaii</Option>
                    <Option value="ID">Idaho</Option>
                    <Option value="IL">Illinois</Option>
                    <Option value="IN">Indiana</Option>
                    <Option value="IA">Iowa</Option>
                    <Option value="KS">Kansas</Option>
                    <Option value="KY">Kentucky</Option>
                    <Option value="LA">Louisiana</Option>
                    <Option value="ME">Maine</Option>
                    <Option value="MD">Maryland</Option>
                    <Option value="MA">Massachusetts</Option>
                    <Option value="MI">Michigan</Option>
                    <Option value="MN">Minnesota</Option>
                    <Option value="MS">Mississippi</Option>
                    <Option value="MO">Missouri</Option>
                    <Option value="MT">Montana</Option>
                    <Option value="NE">Nebraska</Option>
                    <Option value="NV">Nevada</Option>
                    <Option value="NH">New Hampshire</Option>
                    <Option value="NJ">New Jersey</Option>
                    <Option value="NM">New Mexico</Option>
                    <Option value="NY">New York</Option>
                    <Option value="NC">North Carolina</Option>
                    <Option value="ND">North Dakota</Option>
                    <Option value="OH">Ohio</Option>
                    <Option value="OK">Oklahoma</Option>
                    <Option value="OR">Oregon</Option>
                    <Option value="PA">Pennsylvania</Option>
                    <Option value="RI">Rhode Island</Option>
                    <Option value="SC">South Carolina</Option>
                    <Option value="SD">South Dakota</Option>
                    <Option value="TN">Tennessee</Option>
                    <Option value="TX">Texas</Option>
                    <Option value="UT">Utah</Option>
                    <Option value="VT">Vermont</Option>
                    <Option value="VA">Virginia</Option>
                    <Option value="WA">Washington</Option>
                    <Option value="WV">West Virginia</Option>
                    <Option value="WI">Wisconsin</Option>
                    <Option value="WY">Wyoming</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="zipcode"
                  label="ZIP Code"
                  rules={[{ required: true, message: 'ZIP code is required' }]}
                >
                  <Input placeholder="ZIP Code" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="tax_id"
              label="Tax ID (EIN)"
            >
              <Input placeholder="Tax ID (Optional)" />
            </Form.Item>
          </div>

          {/* Card Information */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCardOutlined className="mr-2 text-sky-600" />
              Card Information
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="card_number"
                  label="Card Number"
                  rules={[
                    { required: true, message: 'Card number is required' },
                    { pattern: /^\d{16}$/, message: 'Please enter a valid 16-digit card number' }
                  ]}
                >
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    maxLength={16}
                    prefix={<CreditCardOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="card_brand"
                  label="Card Brand"
                  rules={[{ required: true, message: 'Card brand is required' }]}
                >
                  <Select placeholder="Select Card Brand">
                    <Option value="visa">Visa</Option>
                    <Option value="mastercard">Mastercard</Option>
                    <Option value="amex">American Express</Option>
                    <Option value="discover">Discover</Option>
                    <Option value="jcb">JCB</Option>
                    <Option value="unionpay">UnionPay</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="card_expiry"
                  label="Expiry Date"
                  rules={[
                    { required: true, message: 'Expiry date is required' },
                    { pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/, message: 'Format: MM/YY' }
                  ]}
                >
                  <Input placeholder="MM/YY" maxLength={5} />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="card_cvc"
                  label="CVC/CVV"
                  rules={[
                    { required: true, message: 'CVC is required' },
                    { pattern: /^\d{3,4}$/, message: 'Please enter a valid CVC' }
                  ]}
                >
                  <Input placeholder="123" maxLength={4} />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="card_holder_name"
                  label="Cardholder Name"
                  rules={[{ required: true, message: 'Cardholder name is required' }]}
                >
                  <Input placeholder="As it appears on card" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bank_name"
                  label="Bank Name"
                  rules={[{ required: true, message: 'Bank name is required' }]}
                >
                  <Input 
                    placeholder="e.g., Chase, Bank of America" 
                    prefix={<BankOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="account_type"
                  label="Account Type"
                  rules={[{ required: true, message: 'Account type is required' }]}
                >
                  <Select placeholder="Select Account Type">
                    <Option value="checking">Checking</Option>
                    <Option value="savings">Savings</Option>
                    <Option value="credit">Credit Card</Option>
                    <Option value="debit">Debit Card</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between pt-4">
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-sky-600 hover:bg-sky-700"
              size="large"
              icon={<CreditCardOutlined />}
            >
              {loading ? 'Creating Customer...' : 'Create Stripe Customer'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default StripeCustomerSetup;
