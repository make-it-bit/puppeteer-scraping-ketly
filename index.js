const puppeteer = require('puppeteer');

const scrapeUrls = async (input) => {
  let theUrls = [];
  try {
    let previousHeight;
    while (true) {
      const newUrls = await input.page.evaluate(() => {
        const cars = document.querySelectorAll('.listbox_auto');
        let urls = [];
        for (let car of cars) {
          urls.push(car.querySelector('a').href);
        }
        return urls;
      });
      theUrls = [...new Set([...theUrls, ...newUrls])];
      if (theUrls.length == input.quantityOfCars) break;
      previousHeight = await input.page.evaluate('document.body.scrollHeight');
      await input.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await input.page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await input.page.waitForTimeout(input.scrollDelay);
    }
    return theUrls;
  } catch (error) {
    console.log('error: ', error);
    return;
  }
};

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto('https://www.nettiauto.com/yritys/2267640/vaihtoautot', {
      waitUntil: 'domcontentloaded',
    });

    const quantityOfCars = await page.evaluate(() => document.querySelector('.nav_col1').innerText.split(' ')[0]);
    const scrollDelay = 1000;
    const carUrls = await scrapeUrls({ page, quantityOfCars, scrollDelay });

    console.log(`There are ${carUrls.length} urls:`);
    console.log(carUrls);

    await browser.close();
    return;
  } catch (error) {
    console.log('error: ', error);
    return;
  }
})();
