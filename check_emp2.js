const fs = require('fs');
const html = fs.readFileSync('c:/Users/LENOVO/Desktop/application/employes.html', 'utf8');
const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if(match) { 
    const code = match[1].replace(/import\s+[\s\S]*?from\s+['"].*?['"];/g, ''); 
    try { 
        require('vm').runInNewContext(code, { window: {}, document: {}, emailjs: {}, alert: console.log, console: console }); 
        console.log("Syntax OK");
    } catch(e) { 
        console.log(e.stack); 
    } 
}
