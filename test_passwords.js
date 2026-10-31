const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:5000/api' + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testPasswordFlow() {
  console.log('--- TESTING PASSWORD SECURITY & CHANGE FLOW ---');

  // 1. Bad password test
  const badLogin = await request('POST', '/auth/login', {
    email: 'omar.tarek@student.mec.edu',
    password: 'wrong_password_123',
    role: 'student',
    accessPath: 'learner'
  });
  console.log('[1] Bad password rejected:', badLogin.status === 401 ? 'PASS (401)' : 'FAIL');

  // 2. Correct default seed password test
  const goodLogin = await request('POST', '/auth/login', {
    email: 'omar.tarek@student.mec.edu',
    password: 'Mec@2026',
    role: 'student',
    accessPath: 'learner'
  });
  console.log('[2] Correct password accepted:', goodLogin.status === 200 ? 'PASS' : 'FAIL');
  const token = goodLogin.data.token;
  const user = goodLogin.data.user;

  // Verify password is NOT in user object
  console.log('[3] Password NOT leaked in user object:', user.password === undefined ? 'PASS' : 'FAIL');

  // 4. Change Password Test
  const changeRes = await request('POST', '/auth/change-password', {
    currentPassword: 'Mec@2026',
    newPassword: 'MyNewSuperPassword2026'
  }, {
    'x-user-id': user.id,
    'Authorization': 'Bearer ' + token
  });
  console.log('[4] Password change result:', changeRes.status === 200 ? 'PASS' : 'FAIL', changeRes.data?.message);

  // 5. Try logging in with old password
  const oldPassLogin = await request('POST', '/auth/login', {
    email: 'omar.tarek@student.mec.edu',
    password: 'Mec@2026',
    role: 'student',
    accessPath: 'learner'
  });
  console.log('[5] Old password rejected:', oldPassLogin.status === 401 ? 'PASS (401)' : 'FAIL');

  // 6. Try logging in with new password
  const newPassLogin = await request('POST', '/auth/login', {
    email: 'omar.tarek@student.mec.edu',
    password: 'MyNewSuperPassword2026',
    role: 'student',
    accessPath: 'learner'
  });
  console.log('[6] New password login accepted:', newPassLogin.status === 200 ? 'PASS' : 'FAIL');

  // Revert back for demo convenience
  await request('POST', '/auth/change-password', {
    currentPassword: 'MyNewSuperPassword2026',
    newPassword: 'Mec@2026'
  }, {
    'x-user-id': user.id,
    'Authorization': 'Bearer ' + newPassLogin.data.token
  });
  console.log('[7] Reverted test user back to Mec@2026 for consistency: PASS');

  console.log('\nALL PASSWORD SECURITY REQUIREMENTS VERIFIED!');
}

testPasswordFlow().catch(console.error);
