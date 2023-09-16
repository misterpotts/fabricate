import * as fs from "fs";
const packageContents = fs.readFileSync('package.json', 'utf8');
const packageJson = JSON.parse(packageContents);
console.log(packageJson.version);
