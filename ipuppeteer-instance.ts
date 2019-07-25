import puppeteer from 'puppeteer';

export interface IPupetterInstance {
  page: puppeteer.Page;
  browser: puppeteer.Browser;
}
