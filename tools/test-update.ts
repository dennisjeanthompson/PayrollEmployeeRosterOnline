
async function testApi() {
  console.log('Testing Employee Update...');

  // 1. Log in as admin to get a session cookie
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  if (!loginRes.ok) {
    const body = await loginRes.text();
    console.error('Login failed', loginRes.status, body);
    return;
  }

  // Extract the Set-Cookie header
  const setCookieHeader = loginRes.headers.get('set-cookie');
  if (!setCookieHeader) {
    console.error('No set-cookie header received');
    return;
  }
  // We only need the first token (name=value) without the attributes
  const cookie = setCookieHeader.split(';')[0];
  console.log('Got session cookie:', cookie.substring(0, 30) + '...');

  // 2. Fetch all employees - note admin might not be 'manager' role, so use a manager account
  // First try the /api/auth/me endpoint to confirm we are logged in
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Cookie': cookie }
  });
  if (!meRes.ok) {
    console.error('/api/auth/me failed', meRes.status);
    return;
  }
  const meData = await meRes.json();
  console.log('Logged in as:', meData.user.username, 'role:', meData.user.role);

  // 3. Update the admin's own profile (TIN + email) via /api/auth/profile
  const testTin = '123-TEST-TIN-' + Date.now();
  console.log(`\nStep 1: Updating TIN to "${testTin}"...`);
  const profileUpdateRes = await fetch('http://localhost:5000/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      firstName: meData.user.firstName,
      lastName: meData.user.lastName,
      email: meData.user.email,
      tin: testTin,
    })
  });

  const profileUpdateData = await profileUpdateRes.json();
  if (!profileUpdateRes.ok) {
    console.error('Profile update failed:', profileUpdateData);
    return;
  }
  console.log('Profile update response:', JSON.stringify({ message: profileUpdateData.message, tin: profileUpdateData.user?.tin }));

  // 4. Re-fetch /api/auth/me to verify the change persisted in the database
  console.log('\nStep 2: Re-fetching /api/auth/me to verify persistence...');
  const verifyRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Cookie': cookie }
  });
  const verifyData = await verifyRes.json();
  console.log('Verified TIN from /api/auth/me:', verifyData.user.tin);
  
  if (verifyData.user.tin === testTin) {
    console.log('\n✅ SUCCESS: TIN correctly persisted in database!');
  } else {
    console.log('\n❌ FAILURE: TIN was NOT persisted. Expected:', testTin, 'Got:', verifyData.user.tin);
  }
}

testApi().catch(console.error);
