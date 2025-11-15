const fs = require('fs');
const text = fs.readFileSync('tmp_en.html', 'utf8');
const pattern = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;
const match = text.match(pattern);
if (!match) {
  console.error('NEXT_DATA not found');
  process.exit(1);
}
const data = JSON.parse(match[1]);
console.log('keys', Object.keys(data));
console.log('locale', data.locale);
console.log('buildId', data.buildId);
console.log('locales', data.locales);
console.log('defaultLocale', data.defaultLocale);
console.log('page', data.page);
console.log('query', data.query);
console.log('pageProps keys', Object.keys(data.props.pageProps));
