import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    const args = msg.args();
    Promise.all(args.map(a => a.jsonValue())).then(vals => {
      console.log('PAGE LOG:', msg.type(), ...vals);
    }).catch(() => console.log('PAGE LOG:', msg.type(), msg.text()));
  });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    await page.goto('http://localhost:10000', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error('NAV ERROR:', e);
  }

  await browser.close();
})();
