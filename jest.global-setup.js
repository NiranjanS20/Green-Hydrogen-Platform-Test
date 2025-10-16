module.exports = async () => {
  // Global setup for Jest tests
  console.log('🧪 Setting up Jest test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET = 'test-bucket';
  
  // Mock any global services or APIs that need setup
  console.log('✅ Jest test environment setup complete');
};
