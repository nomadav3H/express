import http from 'http';
import assert from 'assert';
import querystring from 'querystring';
import app from '../app.js'; // Adjust the path as necessary

const port = 3001; // Use a different port for testing

let server;

// Start the server
const startServer = () => {
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
};

// Close the server
const closeServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test server stopped');
      resolve();
    });
  });
};

// Test if it redirects to login if not logged in
const testRedirectToLogin = () => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/`, (res) => {
      try {
        assert.strictEqual(res.statusCode, 302);
        assert.strictEqual(res.headers.location, '/login');
        console.log('testRedirectToLogin passed');
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Test if it renders login page if not logged in
const testRenderLoginPage = () => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/login`, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);
          assert(body.includes('form'));
          console.log('testRenderLoginPage passed');
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });
};

// Test if it redirects to dashboard after login
const testRedirectToDashboardAfterLogin = () => {
  return new Promise((resolve, reject) => {
    // Prepare the login POST request
    const postData = querystring.stringify({
      username: 'henderson.briggs@geeknet.net',
      password: '23derd*334'
    });

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      try {
        assert.strictEqual(res.statusCode, 302);
        assert.strictEqual(res.headers.location, '/dashboard/');

        // Extract cookies from the response headers
        const cookies = res.headers['set-cookie'];

        // Make a GET request to the dashboard with the extracted cookies
        const optionsDashboard = {
          hostname: 'localhost',
          port: port,
          path: '/dashboard/',
          method: 'GET',
          headers: {
            'Cookie': cookies.join('; ')
          }
        };

        const reqDashboard = http.request(optionsDashboard, (resDashboard) => {
          let body = '';
          resDashboard.on('data', (chunk) => {
            body += chunk;
          });
          resDashboard.on('end', () => {
            try {
              assert.strictEqual(resDashboard.statusCode, 200);
              assert(body.includes('Dashboard')); // Adjust this based on your dashboard content
              console.log('testRedirectToDashboardAfterLogin passed');
              resolve(cookies); // Resolve with cookies for next test
            } catch (err) {
              reject(err);
            }
          });
        });

        reqDashboard.end();
      } catch (err) {
        reject(err);
      }
    });

    req.write(postData);
    req.end();
  });
};

// Test if it logs out and redirects to login page
const testLogout = (cookies) => {
  return new Promise((resolve, reject) => {
    // Make a GET request to logout with the extracted cookies
    const optionsLogout = {
      hostname: 'localhost',
      port: port,
      path: '/logout',
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; ')
      }
    };

    const reqLogout = http.request(optionsLogout, (resLogout) => {
      try {
        assert.strictEqual(resLogout.statusCode, 302);
        assert.strictEqual(resLogout.headers.location, '/login');
        console.log('testLogout passed');

        // Make a GET request to the dashboard again to ensure the session is destroyed
        const optionsDashboard = {
          hostname: 'localhost',
          port: port,
          path: '/dashboard/',
          method: 'GET',
          headers: {
            'Cookie': cookies.join('; ')
          }
        };

        const reqDashboard = http.request(optionsDashboard, (resDashboard) => {
          try {
            assert.strictEqual(resDashboard.statusCode, 302);
            assert.strictEqual(resDashboard.headers.location, '/login');
            console.log('testLogoutSessionDestroyed passed');
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        reqDashboard.end();
      } catch (err) {
        reject(err);
      }
    });

    reqLogout.end();
  });
};

// Run the tests
const runTests = async () => {
  await startServer();

  try {
    await testRedirectToLogin();
    await testRenderLoginPage();
    const cookies = await testRedirectToDashboardAfterLogin();
    await testLogout(cookies);
    console.log('All tests passed');
  } catch (err) {
    console.error('Test failed:', err);
  }

  await closeServer();
};

runTests();

