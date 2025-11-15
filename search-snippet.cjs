const fs = require('fs');
const text = fs.readFileSync('tmp_en.html', 'utf8');
function show(needle) {
  const idx = text.indexOf(needle);
  console.log('needle', needle, 'index', idx);
  if (idx >= 0) {
    console.log(text.slice(Math.max(0, idx - 200), idx + 400));
  }
}
show('"timezones"');
show('"languages"');
show('timezoneOptions');
show('languageOptions');
