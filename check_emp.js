const fs = require('fs');
try {
    const code = fs.readFileSync('c:/Users/LENOVO/Desktop/application/employes.html', 'utf8')
        .replace(/<script type="module">([\s\S]*?)<\/script>/, '$1')
        .replace(/import\s+[\s\S]*?from\s+['"].*?['"];/g, ''); 
    require('vm').runInNewContext(code, { 
        window: {}, document: {}, emailjs: {}, alert: console.log, console: console 
    });
} catch(e) { 
    console.log(e.stack); 
}
