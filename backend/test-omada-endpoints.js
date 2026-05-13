const https = require('https');

const OMADA_HOST = process.env.OMADA_HOST || '192.168.71.12';
const OMADA_PORT = process.env.OMADA_PORT || 8043;

const endpoints = [
  '/web/api/v1/auth/login',
  '/eap/web/api/v1/auth/login',
  '/api/web/v1/auth/login',
  '/eap/web/api/auth/login',
  '/web/api/auth/login',
  '/api/v1/auth/login',
  '/web/api/v2/auth/login',
  '/eap/web/api/v2/auth/login'
];

function testEndpoint(path) {
  return new Promise((resolve) => {
    console.log(`\nTesting: ${path}`);
    const options = {
      hostname: OMADA_HOST,
      port: OMADA_PORT,
      path: path,
      method: 'GET',
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Body: ${data.substring(0, 150)}`);
        resolve({ path, status: res.statusCode, body: data.substring(0, 150) });
      });
    });

    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`);
      resolve({ path, status: 'ERROR', body: e.message });
    });

    req.end();
  });
}

async function main() {
  console.log(`Testing Omada API endpoints on https://${OMADA_HOST}:${OMADA_PORT}`);
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

main();