
async function testRoute(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
    console.log(`Size: ${text.length} bytes`);
    console.log(`Response Prefix: ${text.substring(0, 100)}`);
    console.log('------------------------------------------------');
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
  }
}

async function run() {
  await testRoute('http://localhost:5000/api/analytics/trends');
  await testRoute('http://localhost:5000/api/forecast/labor?days=30');
  await testRoute('http://localhost:5000/api/forecast/payroll?days=30');
}

run();
