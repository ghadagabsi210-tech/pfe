const fs = require('fs');

try {
    const code = fs.readFileSync('c:/Users/LENOVO/Desktop/application/scratch.js', 'utf8')
        .replace(/import\s+[\s\S]*?from\s+['"].*?['"];/g, ''); 
    require('vm').runInNewContext(code, { 
        window: {}, document: {}, emailjs: {}, alert: console.log, console: console 
    });
} catch(e) { 
    console.log(e.stack); 
}
