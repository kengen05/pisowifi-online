const https = require('https');

const OMADA_HOST = process.env.OMADA_HOST || '192.168.71.12';
const OMADA_PORT = process.env.OMADA_PORT || 8043;
const OMADA_USER = process.env.OMADA_USERNAME || 'admin';
const OMADA_PASS = process.env.OMADA_PASSWORD || '';

// Try different POST login endpoints
const loginEndpoints = [
  '/web/api/v1/auth/login',
  '/web/api/v2/auth/login',
  '/web/api/auth/login',
];

const versions = ['v1', 'v2'];
const paths = ['auth', 'user', 'login', 'token'];

async function testPostLogin(endpoint) {
  return new Promise((resolve) => {
    console.log(`\nTesting POST login: ${endpoint}`);
    
    const postData = JSON.stringify({
      username: OMADA_USER,
      password: OMADA_PASS
    });

    const options = {
      hostname: OMADA_HOST,
      port: OMADA_PORT,
      path: endpoint,
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Headers: ${JSON.stringify(res.headers)}`);
        console.log(`  Body: ${data.substring(0, 200)}`);
        resolve({ endpoint, status: res.statusCode, body: data.substring(0, 200) });
      });
    });

    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`);
      resolve({ endpoint, status: 'ERROR', body: e.message });
    });

    req.write(postData);
    req.end();
  });
}

// Also try to discover the API by checking the main page
function testMainPage() {
  return new Promise((resolve) => {
    console.log('\n\nTesting main page:');
    const options = {
      hostname: OMADA_HOST,
      port: OMADA_PORT,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Look for API references in the HTML
        const apiRefs = data.match(/\/web\/api\/[^"']+/g) || [];
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  API references found: ${apiRefs.slice(0, 10).join(', ')}`);
        resolve({ status: res.statusCode, apiRefs: apiRefs.slice(0, 10) });
      });
    });

    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`);
      resolve({ status: 'ERROR', apiRefs: [] });
    });

    req.end();
  });
}

async function main() {
  console.log(`Testing POST login on https://${OMADA_HOST}:${OMADA_PORT}`);
  console.log(`Username: ${OMADA_USER}`);
  
  // Test POST login endpoints
  for (const endpoint of loginEndpoints) {
    await testPostLogin(endpoint);
  }
  
  // Check main page for API references
  await testMainPage();
}

main();