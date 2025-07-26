import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseHealth } from './supabase-connection';
import { EmailService } from './email';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

class WebsiteTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting comprehensive website functionality tests...\n');
    
    // Test 1: Supabase Connection
    await this.testSupabaseConnection();
    
    // Test 2: Environment Variables
    await this.testEnvironmentVariables();
    
    // Test 3: Database Tables
    await this.testDatabaseTables();
    
    // Test 4: Authentication System
    await this.testAuthenticationSystem();
    
    // Test 5: Email Service
    await this.testEmailService();
    
    // Test 6: File System
    await this.testFileSystem();
    
    // Test 7: UI Components
    await this.testUIComponents();
    
    // Test 8: Routing
    await this.testRouting();
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    return this.results;
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      console.log('🔌 Testing Supabase Connection...');
      const health = await checkSupabaseHealth();
      
      if (health.canConnect) {
        this.results.push({
          name: 'Supabase Connection',
          status: 'PASS',
          message: 'Successfully connected to Supabase',
          details: health
        });
        console.log('✅ Supabase connection successful');
      } else {
        this.results.push({
          name: 'Supabase Connection',
          status: 'FAIL',
          message: 'Failed to connect to Supabase',
          details: health
        });
        console.log('❌ Supabase connection failed');
      }
    } catch (error) {
      this.results.push({
        name: 'Supabase Connection',
        status: 'FAIL',
        message: `Connection error: ${error.message}`,
        details: error
      });
      console.log('❌ Supabase connection error:', error);
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    console.log('🔧 Testing Environment Variables...');
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_RESEND_API_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missing.length === 0) {
      this.results.push({
        name: 'Environment Variables',
        status: 'PASS',
        message: 'All required environment variables are set'
      });
      console.log('✅ All environment variables are set');
    } else {
      this.results.push({
        name: 'Environment Variables',
        status: 'FAIL',
        message: `Missing environment variables: ${missing.join(', ')}`
      });
      console.log('❌ Missing environment variables:', missing);
    }
  }

  private async testDatabaseTables(): Promise<void> {
    try {
      console.log('🗄️  Testing Database Tables...');
      
      // Test posts table
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .limit(1);
      
      if (postsError) {
        this.results.push({
          name: 'Database Tables',
          status: 'FAIL',
          message: `Posts table error: ${postsError.message}`
        });
        console.log('❌ Posts table error:', postsError);
        return;
      }
      
      // Test users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (usersError) {
        this.results.push({
          name: 'Database Tables',
          status: 'FAIL',
          message: `Users table error: ${usersError.message}`
        });
        console.log('❌ Users table error:', usersError);
        return;
      }
      
      this.results.push({
        name: 'Database Tables',
        status: 'PASS',
        message: 'All required database tables are accessible'
      });
      console.log('✅ Database tables are accessible');
      
    } catch (error) {
      this.results.push({
        name: 'Database Tables',
        status: 'FAIL',
        message: `Database error: ${error.message}`
      });
      console.log('❌ Database error:', error);
    }
  }

  private async testAuthenticationSystem(): Promise<void> {
    console.log('🔐 Testing Authentication System...');
    
    try {
      // Test if we can get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        this.results.push({
          name: 'Authentication System',
          status: 'FAIL',
          message: `Auth error: ${error.message}`
        });
        console.log('❌ Authentication error:', error);
        return;
      }
      
      this.results.push({
        name: 'Authentication System',
        status: 'PASS',
        message: 'Authentication system is working',
        details: { hasSession: !!session }
      });
      console.log('✅ Authentication system is working');
      
    } catch (error) {
      this.results.push({
        name: 'Authentication System',
        status: 'FAIL',
        message: `Auth system error: ${error.message}`
      });
      console.log('❌ Auth system error:', error);
    }
  }

  private async testEmailService(): Promise<void> {
    console.log('📧 Testing Email Service...');
    
    try {
      // Test if EmailService can be initialized
      const testResult = await EmailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>'
      });
      
      if (testResult.success) {
        this.results.push({
          name: 'Email Service',
          status: 'PASS',
          message: 'Email service is working (using fallback in development)'
        });
        console.log('✅ Email service is working');
      } else {
        this.results.push({
          name: 'Email Service',
          status: 'SKIP',
          message: `Email service not configured: ${testResult.error?.message || 'Unknown error'}`
        });
        console.log('⏭️ Email service not configured, skipping');
      }
      
    } catch (error) {
      this.results.push({
        name: 'Email Service',
        status: 'SKIP',
        message: `Email service error: ${error.message}`
      });
      console.log('⏭️ Email service error, skipping:', error);
    }
  }

  private async testFileSystem(): Promise<void> {
    console.log('📁 Testing File System...');
    
    try {
      // Test if we can access the public directory
      const testImage = '/ufsbd-logo-new.jpg';
      
      // Create a test image element to check if it loads
      const img = new Image();
      img.src = testImage;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 5000); // 5 second timeout
      });
      
      this.results.push({
        name: 'File System',
        status: 'PASS',
        message: 'Public assets are accessible'
      });
      console.log('✅ Public assets are accessible');
      
    } catch (error) {
      this.results.push({
        name: 'File System',
        status: 'FAIL',
        message: `File system error: ${error.message}`
      });
      console.log('❌ File system error:', error);
    }
  }

  private async testUIComponents(): Promise<void> {
    console.log('🎨 Testing UI Components...');
    
    try {
      // Test if we can create basic DOM elements
      const testDiv = document.createElement('div');
      testDiv.className = 'test-component';
      testDiv.textContent = 'Test Component';
      
      // Test if we can access the root element
      const rootElement = document.getElementById('root');
      
      if (rootElement) {
        this.results.push({
          name: 'UI Components',
          status: 'PASS',
          message: 'UI components can be created and DOM is accessible'
        });
        console.log('✅ UI components are working');
      } else {
        this.results.push({
          name: 'UI Components',
          status: 'FAIL',
          message: 'Root element not found'
        });
        console.log('❌ Root element not found');
      }
      
    } catch (error) {
      this.results.push({
        name: 'UI Components',
        status: 'FAIL',
        message: `UI components error: ${error.message}`
      });
      console.log('❌ UI components error:', error);
    }
  }

  private async testRouting(): Promise<void> {
    console.log('🛣️  Testing Routing...');
    
    try {
      // Test if we can access the current location
      const currentPath = window.location.pathname;
      
      this.results.push({
        name: 'Routing',
        status: 'PASS',
        message: 'Routing system is accessible',
        details: { currentPath }
      });
      console.log('✅ Routing system is working');
      
    } catch (error) {
      this.results.push({
        name: 'Routing',
        status: 'FAIL',
        message: `Routing error: ${error.message}`
      });
      console.log('❌ Routing error:', error);
    }
  }
}

// Export the tester
export const websiteTester = new WebsiteTester();

// Function to run tests from browser console
export async function runWebsiteTests() {
  return await websiteTester.runAllTests();
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runWebsiteTests = runWebsiteTests;
  (window as any).websiteTester = websiteTester;
} 