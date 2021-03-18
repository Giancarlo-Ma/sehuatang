const puppeteer = require('puppeteer');
const process = require('process');
const Movie = require('../models/movie');
const scrollToBottom = require("scroll-to-bottomjs");

(async () => {
  let website = 'https://sehuatang.org/'
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  const filterList = ['高清中文字幕', '欧美无码', '国产原创']

  /**
   * [ { href: 'https://sehuatang.org/forum-106-1.html', title: '每日合集' } ]
   */
  let firstLinks = await getFirstLinks(website, page, '.fl_g')
  firstLinks = firstLinks.filter(link => filterList.includes(link.title))
  /**
   * [{
      href: 'https://sehuatang.org/thread-372568-1-1.html',
      section: '每日合集',
      title: '91国产合集'
    }]
   */
  const secondLinks = await Promise.all(firstLinks.map(l => getSecondLinks(website, l, browser, '[id^="normalthread"]', 1)))
  const thirdLinks = await Promise.all(secondLinks.flat().map(item => getThirdLinks(item.href, browser, '[id^="postmessage_"]', item.section)));
  
  process.send({ type: 'secondLinks', data: thirdLinks })
  await browser.close();
})()

const getFirstLinks = async (website, page, selector) => {
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
const getSecondLinks = async (website, link, browser, selector, pageCount) => {
  const page = await browser.newPage();
  page.setDefaultTimeout(0)
  await page.goto(link.href)
  for (let i = 0; i < pageCount; i++) {
    // [id^="normalthread"]属性前缀选择器
    await page.waitForSelector('#autopbn');
    await page.click('#autopbn')
  }

  await page.waitForSelector(selector)
  const links = await page.evaluate((selector, website, link) => {
    const selectors = document.querySelectorAll(selector)
    const links = Array.from(selectors).map(l => ({
      href: website + l.querySelector('.s.xst').getAttribute('href'),
      section: link.title,
      title: l.querySelector('.s.xst').innerText
    }))
    return links
  }, selector, website, link)
  await page.close()
  return links
}

const getThirdLinks = async (link, browser, selector, section) => {
  const page = await browser.newPage();
  page.setDefaultTimeout(0);
  await page.goto(link, { "waitUntil": "networkidle0" })
  await page.evaluate(scrollToBottom);
  await page.waitForFunction(imagesHaveLoaded, {timeout: 0});
  // await autoScroll(page);
  // [id^="postmessage_"]第一个post
  await page.waitForSelector(selector);
  const movie = await page.evaluate((selector, section) => {
    const findItem = (lineArr, item) => lineArr.find(line => line.startsWith(item)).slice(item.length)
    const post = document.querySelector(selector)
    const postContent = post.textContent
    // https://stackoverflow.com/questions/784539/how-do-i-replace-all-line-breaks-in-a-string-with-br-elements
    // const title = document.querySelector('h1').textContent.replace(/(?:\r\n|\r|\n)/g, '')
    const lineArr = postContent.split('\n')
    const title = findItem(lineArr, '【影片名称】：')
    const actor = findItem(lineArr, '【出演女优】：')
    const size = findItem(lineArr, '【影片大小】：')
    const mosaic = findItem(lineArr, '【是否有码】：') === '有码'
    const imgs = Array.from(post.querySelectorAll('img[id^="aimg"]')).map(item => item.getAttribute('src'))
    const date = document.querySelector('[id^="authorposton"] span') ?
      new Date(document.querySelector('[id^="authorposton"] span').getAttribute('title')) :
      findItem([document.querySelector('[id^="authorposton"]').textContent], '发表于 ');
    const magnet = document.querySelector('.blockcode li').textContent
    return {
      title,
      actor,
      size,
      mosaic,
      imgs,
      // date,
      magnet,
      section
    }
  }, selector, section)
  await page.close()
  return movie
}

function imagesHaveLoaded() {
    return Array.from(document.images).every((i) => i.complete);
}