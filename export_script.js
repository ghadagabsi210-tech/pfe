const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOVO/Desktop/application/prof.html', 'utf8');
const scriptMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/);
if (scriptMatch) {
    fs.writeFileSync('c:/Users/LENOVO/Desktop/application/scratch.js', scriptMatch[1]);
}
