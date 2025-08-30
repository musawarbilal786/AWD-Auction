// Stripe Configuration
export const STRIPE_CONFIG = {
  // Test keys (for development)
  TEST_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY || '',
  TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || '',
  
  // Live keys (for production)
  LIVE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLIC_KEY || '',
  LIVE_SECRET_KEY: process.env.STRIPE_LIVE_SECRET_KEY || '',
  
  // Mode configuration
  LIVE_MODE: process.env.STRIPE_LIVE_MODE === 'true' || false,
  
  // Get current public key based on mode
  getPublicKey: () => {
    // For frontend direct access, always use test public key
    return STRIPE_CONFIG.TEST_PUBLIC_KEY;
  },
  
  // Get current secret key based on mode
  getSecretKey: () => {
    return STRIPE_CONFIG.LIVE_MODE 
      ? STRIPE_CONFIG.LIVE_SECRET_KEY 
      : STRIPE_CONFIG.TEST_SECRET_KEY;
  }
};

// Stripe Elements appearance configuration (kept for future use)
export const STRIPE_ELEMENTS_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0ea5e9', // sky-600 to match your theme
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};
