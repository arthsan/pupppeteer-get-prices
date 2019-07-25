import puppeteer from 'puppeteer';
import { IPupetterInstance } from './ipuppeteer-instance';
import { ICheckVariation } from './icheck-variation';

export class PetrobrasScreenshot {

  private async launchPuppeter(): Promise<IPupetterInstance> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://www.petrobras.com.br/pt/produtos-e-servicos/precos-de-venda-as-distribuidoras/gasolina-e-diesel/', { waitUntil: 'networkidle2' });
    return { page, browser };
  }

  private async scrollDown(page: puppeteer.Page): Promise<void> {
    const scrollable_section = '.sub-title';
    await page.waitForSelector('.sub-title');
    await page.evaluate(async selector => {
      const scrollableSection = document.querySelectorAll(selector);
      const scrolPos = scrollableSection[2].offsetTop;
      window.scrollTo(0, scrolPos - 400);
    }, scrollable_section);
  }
    
  private async waterMark(page: puppeteer.Page): Promise<void> {
    await page.evaluate(async () => {
      const $body = document.querySelector('body');
      if (!$body) return;
      
      const img = document.createElement('img');
      img.id = 'petrocall';
      
      function waitForImageToLoad(imageElement) {
        return new Promise(resolve => { imageElement.onload = resolve; });
      }

      const imageUrl = 'http://www.petrobras.com.br/sitepetrobras/imgs/bg/logo-social.png';
      img.src = imageUrl;
      (img as any).style = 'position: fixed; bottom: 20px; right: 20px';
      
      await waitForImageToLoad(img);
      
      $body.appendChild(img);

      const scrolled = document.querySelector('#petrocall');

      if (!scrolled) return;

    });
  }

  private async makeScreenshotSmartphone(page: puppeteer.Page) {
    await page.setViewport({
      width: 375,
      height: 677,
      deviceScaleFactor: 1,
    });
    await page.waitForSelector('#petrocall', {
      visible: true
    });
    await page.screenshot({ path: 'screenshot-smartphone.jpg' });
  }
  
  private async makeScreenshotDesktop(page: puppeteer.Page) {
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    await page.screenshot({ path: 'screenshot-desktop.jpg', fullPage: true });
  }

  private async checkVariation(page: puppeteer.Page): Promise<ICheckVariation> {
    const textVariation = await page.evaluate(async () => {
      const variation = document.querySelector('#wrapper-gc__sheets-viewport + p + p');
      if (!variation) throw new Error('Elemento com o conteúdo da variação não encontrado');
      return variation.textContent;
    });

    if (!textVariation) {
      return { priceChange: false };
    }

    const gasolinaKeyword = 'Gasolina: ';
    const dieselKeyword = 'Diesel: ';
    const SEM_VARIACAO = 'sem reajuste';

    if (!textVariation.includes(gasolinaKeyword) && !textVariation.includes(dieselKeyword)) {
      return { priceChange: false };
    }

    const dieselPosition = textVariation.indexOf(dieselKeyword);
    const gasolinePosition = textVariation.indexOf(gasolinaKeyword);

    const gasolinaAjuste = textVariation.substr(gasolinePosition, dieselPosition - gasolinePosition).substr(gasolinaKeyword.length).trim();
    const dieselAjuste = textVariation.substr(dieselPosition).substr(dieselKeyword.length).trim();
    const priceChange = dieselAjuste !== SEM_VARIACAO || gasolinaAjuste !== SEM_VARIACAO;

    return {
      priceChange,
      gasolinaAjuste,
      dieselAjuste
    };
  }
  
  async getScreenshotSmartphone(): Promise<boolean> {
    try {
      const { browser, page } = await this.launchPuppeter();
      const validation = await this.checkVariation(page);
      if (!validation.priceChange) {
        await browser.close();
        return false;
      }
      await this.scrollDown(page);
      await this.waterMark(page);
      await this.makeScreenshotSmartphone(page);
      await browser.close();
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getScreenshotDesktop(): Promise<boolean> {
    try {
      const { browser, page } = await this.launchPuppeter();
      const validation = await this.checkVariation(page);
      if (!validation.priceChange) {
        await browser.close();
        return false;
      }
      await this.makeScreenshotDesktop(page);
      await browser.close();
      return true;
    } catch (error) {
      throw error;
    }
  }
}


