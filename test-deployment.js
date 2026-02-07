// Test script to verify deployment once it's ready
const https = require('https');

async function testDeployment() {
    const url = 'https://chatbot-eight-pi-61.vercel.app/';
    
    console.log('Testing deployment at:', url);
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
            
            if (res.statusCode === 200) {
                console.log('✅ SUCCESS: Application is running!');
                console.log('You can now test the full functionality.');
            } else if (res.statusCode === 500) {
                console.log('❌ ERROR: Server is still having issues');
                console.log('Please check Vercel environment variables and redeploy');
            } else {
                console.log(`⚠️  STATUS: ${res.statusCode} - May need further investigation`);
            }
            
            res.on('data', (chunk) => {
                // Don't log the full response for now, just status
            });
            
            res.on('end', () => {
                resolve(res.statusCode);
            });
        }).on('error', (err) => {
            console.error('❌ Request failed:', err.message);
            reject(err);
        });
    });
}

// Run the test
testDeployment().catch(console.error);