const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 375,
    height: 677,
    deviceScaleFactor: 1,
  });
  await page.goto('https://prontocombustiveis.com.br/', {waitUntil: 'networkidle2'});
  await page.screenshot({path: 'example.jpg'});

  await browser.close();
})();