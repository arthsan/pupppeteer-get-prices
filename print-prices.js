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
  let image = await page.evaluate(async selector => {
    const scrollableSection = document.querySelectorAll( selector );
    const scrolPos = scrollableSection[2].offsetTop;

    const $body = document.querySelector('body');
    const img = document.createElement('img');
    img.id = 'petrocall';

    function waitForImageToLoad(imageElement){
      return new Promise(resolve=>{imageElement.onload = resolve})
    }

    const imageUrl2 = 'http://www.petrobras.com.br/sitepetrobras/imgs/bg/logo-social.png';
    img.src = imageUrl2;
    img.style = 'position: fixed; bottom: 20px; right: 20px';
    
    await waitForImageToLoad(img)
    
    $body.appendChild(img);

    window.scrollTo(0, scrolPos-400);
    
    return document.querySelector('#petrocall').complete;
  }, scrollable_section );
  console.log(image)
  await page.waitForSelector('#petrocall', {
    visible: true
  })

  await page.screenshot({path: 'example6.jpg'});
  await browser.close();
})();






