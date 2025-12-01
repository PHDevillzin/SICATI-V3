const http = require('http');

const testEndpoints = async () => {
    const endpoints = [
        { path: '/companies', method: 'GET' },
        { path: '/third-parties', method: 'GET' },
        { path: '/users', method: 'GET' },
        { path: '/units', method: 'GET' }
    ];

    console.log('Starting API Verification...');

    for (const endpoint of endpoints) {
        await new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 3001,
                path: endpoint.path,
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`[PASS] ${endpoint.method} ${endpoint.path} - Status: ${res.statusCode}`);
                        try {
                            const jsonData = JSON.parse(data);
                            console.log(`       Data count: ${Array.isArray(jsonData) ? jsonData.length : 'Object'}`);
                        } catch (e) {
                            console.log('       Response is not JSON');
                        }
                    } else {
                        console.error(`[FAIL] ${endpoint.method} ${endpoint.path} - Status: ${res.statusCode}`);
                        console.error(`       Error: ${data}`);
                    }
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error(`[FAIL] ${endpoint.method} ${endpoint.path} - Error: ${e.message}`);
                resolve();
            });

            req.end();
        });
    }
    console.log('Verification Complete.');
};

testEndpoints();
