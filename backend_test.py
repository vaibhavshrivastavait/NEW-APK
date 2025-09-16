#!/usr/bin/env python3
"""
Backend Testing Suite for MHT Assessment App
Tests all backend API endpoints and database functionality
"""

import requests
import json
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
backend_dir = Path(__file__).parent / "backend"
load_dotenv(backend_dir / '.env')

# Get frontend environment for backend URL
frontend_dir = Path(__file__).parent / "frontend"
load_dotenv(frontend_dir / '.env')

class BackendTester:
    def __init__(self):
        # Use the local backend URL since this is a simple backend for testing
        self.base_url = "http://localhost:8001"
        self.api_url = f"{self.base_url}/api"
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test GET / endpoint (root health check)"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('message') and 'MHT Assessment API' in data.get('message', ''):
                    self.log_test("Health Check", True, "API root endpoint working correctly")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_status_checks(self):
        """Test GET /api/health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_test("GET Health Check", True, f"Health endpoint working: {data}")
                    return True, data
                else:
                    self.log_test("GET Health Check", False, f"Unexpected response: {data}")
                    return False, None
            else:
                self.log_test("GET Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
        except requests.exceptions.RequestException as e:
            self.log_test("GET Health Check", False, f"Connection error: {str(e)}")
            return False, None
    
    def test_post_status_check(self):
        """Test GET /api/patients endpoint"""
        try:
            response = requests.get(f"{self.api_url}/patients", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'patients' in data and isinstance(data['patients'], list):
                    self.log_test("GET Patients", True, f"Retrieved {len(data['patients'])} patients", data)
                    return True, data
                else:
                    self.log_test("GET Patients", False, "Invalid patients response format")
                    return False, None
            else:
                self.log_test("GET Patients", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except requests.exceptions.RequestException as e:
            self.log_test("GET Patients", False, f"Connection error: {str(e)}")
            return False, None
    
    def test_database_persistence(self):
        """Test basic API connectivity (no database in simple backend)"""
        try:
            # Test root endpoint
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("API Connectivity", True, "Backend API is accessible and responding")
                    return True
                else:
                    self.log_test("API Connectivity", False, f"Unexpected status: {data}")
                    return False
            else:
                self.log_test("API Connectivity", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("API Connectivity", False, f"Error testing connectivity: {str(e)}")
            return False
    
    def test_environment_config(self):
        """Test environment configuration"""
        try:
            # Check if backend URL is accessible
            backend_url = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
            
            # Test if we can reach the backend
            try:
                response = requests.get(backend_url, timeout=5)
                if response.status_code == 200:
                    config_info = {
                        'backend_url': backend_url,
                        'status': 'Backend accessible'
                    }
                    self.log_test("Environment Config", True, "Backend URL configured and accessible", config_info)
                    return True
                else:
                    self.log_test("Environment Config", False, f"Backend not accessible: HTTP {response.status_code}")
                    return False
            except requests.exceptions.RequestException:
                self.log_test("Environment Config", False, f"Cannot reach backend at {backend_url}")
                return False
                
        except Exception as e:
            self.log_test("Environment Config", False, f"Error checking environment: {str(e)}")
            return False
    
    def test_cors_configuration(self):
        """Test CORS configuration by checking response headers"""
        try:
            # Test with Origin header to trigger CORS response
            headers = {'Origin': 'http://localhost:3000'}
            response = requests.get(f"{self.base_url}/", headers=headers, timeout=10)
            
            # Check for CORS headers
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            }
            
            if cors_headers['access-control-allow-origin']:
                self.log_test("CORS Configuration", True, "CORS configured correctly", cors_headers)
                return True
            else:
                self.log_test("CORS Configuration", False, "No CORS headers found", dict(response.headers))
                return False
                    
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Configuration", False, f"Error testing CORS: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("MHT Assessment App - Backend Testing Suite")
        print("=" * 60)
        print(f"Testing backend at: {self.api_url}")
        print()
        
        # Test sequence
        tests = [
            ("Environment Configuration", self.test_environment_config),
            ("Health Check (GET /)", self.test_health_check),
            ("API Health Check (GET /api/health)", self.test_get_status_checks),
            ("Get Patients (GET /api/patients)", self.test_post_status_check),
            ("API Connectivity", self.test_database_persistence),
            ("CORS Configuration", self.test_cors_configuration)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\nRunning: {test_name}")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All backend tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some backend tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()