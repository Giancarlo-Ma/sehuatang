const puppeteer = require('puppeteer');
const process = require('process');

(async () => {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox']
	});
	const page = await browser.newPage();
	const filterList = []
	// 个别切除数组
	filterList.concat(['forum-151-1.html', 'forum-148-1.html', 'forum-149-1.html'])
	process.send({ type: 'homeLinks', data: await getAllLinks(page, '.fl_g', filterList, {from: 28, to: 35}) })
	await browser.close();

})()

const getAllLinks = async (page, selector, filterList, {from, to}) => {
	let website = 'https://sehuatang.org/'
	await page.goto(website);
	await page.waitForSelector(selector);
	return await page.evaluate((selector, filterList, {from,to}, website) => {
		// .fl_g
		const selectors = document.querySelectorAll(selector);
		const links = Array.from(selectors).map(l => l.querySelector('a').getAttribute('href'))
		// 小说区
		filterList.concat(links.slice(from, to))
		return links.filter(l => !filterList.includes(l)).map(l => website + l)
	}, selector, filterList, {from, to}, website);
}