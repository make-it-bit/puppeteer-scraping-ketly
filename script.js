const puppeteer = require('puppeteer');

const scrape_urls = async (page, url_count, scroll_delay) => {
  let the_urls = [];
  try {
    let previous_height;
    while (true) {
      console.log('url_count: ', url_count);
      console.log('the_urls.length: ', the_urls.length);
      const newUrls = await page.evaluate(() => {
        const cars = document.querySelectorAll('.listbox_auto');
        let urls = [];
        for (let car of cars) {
          urls.push(car.querySelector('a').href);
        }
        return urls;
      });

      the_urls = [...new Set([...the_urls, ...newUrls])];

      if (the_urls.length == url_count) break;

      previous_height = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previous_height}`);
      await page.waitForTimeout(scroll_delay);
    }

    return the_urls;
  } catch (error) {
    console.log(error);
    throw error;
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

    const quantity_of_cars = await page.evaluate(() => document.querySelector('.nav_col1').innerText.split(' ')[0]);

    const car_urls = await scrape_urls(page, quantity_of_cars, 1000);
    console.log(`There are ${car_urls.length} urls:`);
    console.log(car_urls);

    await browser.close();
  } catch (error) {
    console.log('error: ', error);
    process.exit(1);
  }
})();
