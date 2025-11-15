const fs = require('fs');
const text = fs.readFileSync('tmp_en.html', 'utf8');
const regex = /\/_next\/static\/chunks[^"']+/g;
const matches = new Set();
let m;
while ((m = regex.exec(text))) {
  matches.add(m[0]);
}
console.log([...matches]);
