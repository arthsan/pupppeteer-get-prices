const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrollable_section = '.sub-title';
  await page.setViewport({
    width: 375,
    height: 677,
    deviceScaleFactor: 1,
  });
  await page.goto('http://www.petrobras.com.br/pt/produtos-e-servicos/precos-de-venda-as-distribuidoras/gasolina-e-diesel/', {waitUntil: 'networkidle2'});
  await page.waitForSelector( '.sub-title' );
  let petPage = await page.evaluate( selector =>
    {
        const scrollableSection = document.querySelectorAll( selector );
        const scrolPos = scrollableSection[2].offsetTop;
        return scrolPos;
      }, scrollable_section );
  await page.evaluate(_ => {
    window.scrollTo(0, 1714-300);
    });
  await page.screenshot({path: 'example.jpg'});

  await browser.close();
})();