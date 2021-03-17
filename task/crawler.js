const puppeteer = require('puppeteer');
const process = require('process');

(async () => {
  let website = 'https://sehuatang.org/'
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  const filterList = ['每日合集']
  let firstLinks = await getAllFirstLinks(website, page, '.fl_g')
  firstLinks = firstLinks.filter(link => filterList.includes(link.title))
  const secondLinks = await Promise.all(firstLinks.map(l => getAllSecondLinks(website, l, browser, '[id^="normalthread"]', 1)))
  process.send({ type: 'secondLinks', data: secondLinks })
  await browser.close();
})()

const getAllFirstLinks = async (website, page, selector) => {
  await page.goto(website);
  await page.waitForSelector(selector);
  return await page.evaluate((selector, website) => {
    // .fl_g
    const selectors = document.querySelectorAll(selector);
    const links = Array.from(selectors).map(l => ({ href: website + l.querySelector('dl dt a').getAttribute('href'), title: l.querySelector('dl dt a').innerText }))

    return links
  }, selector, website);
}

/**
 * pageCount 多少页
 */
const getAllSecondLinks = async (website, link, browser, selector, pageCount) => {
  const page = await browser.newPage();
  page.setDefaultTimeout(10000)
  await page.goto(link.href)
  for (let i = 0; i < pageCount; i++) {
    // [id^="normalthread"]属性前缀选择器
    await page.waitForSelector('#autopbn');
    await page.click('#autopbn')
  }

  await page.waitForSelector(selector)
  return await page.evaluate((selector, website, link) => {
    const selectors = document.querySelectorAll(selector)
    const links = Array.from(selectors).map(l => ({
      href: l.querySelector('.s.xst').getAttribute('href'),
      section: link.title,
      title: l.querySelector('.s.xst').innerText
    }))
    return links
  }, selector, website, link)
}