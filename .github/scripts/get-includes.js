const fs = require('fs');
const moduleContent = fs.readFileSync('dist/module.json', 'utf8');
const moduleJson = JSON.parse(moduleContent);
console.log(moduleJson.includes.join(" "));
