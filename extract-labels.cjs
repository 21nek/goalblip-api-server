const fs = require('fs');
const text = fs.readFileSync('tmp_en.html', 'utf8');
const regex = /\{\\"label\\":\\"([^\\"]+)\\",\\"code\\":\\"([^\\"]+)\\"/g;
const results = [];
let match;
while ((match = regex.exec(text)) !== null) {
  results.push({ label: match[1], code: match[2] });
  if (results.length >= 20) break;
}
console.log(results);
