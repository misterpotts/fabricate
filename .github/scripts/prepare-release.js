#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = process.argv[2];
if (!version) {
    console.error('Version argument is required');
    process.exit(1);
}

async function prepareRelease() {
    try {
        // 1. Update module.json version
        const moduleJsonPath = path.join(__dirname, '../../dist/module.json');
        if (fs.existsSync(moduleJsonPath)) {
            const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
            moduleJson.version = version;
            fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));
            console.log(`Updated module.json version to ${version}`);
        }

        // 2. Get includes from module.json
        const getIncludesScript = path.join(__dirname, 'get-includes.js');
        const includes = execSync(`node ${getIncludesScript}`, { encoding: 'utf8' }).trim();
        console.log(`Files to include: ${includes}`);

        // 3. Create zip file
        const distDir = path.join(__dirname, '../../dist');
        const zipPath = path.join(__dirname, '../../module.zip');

        // Remove existing zip if it exists
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        // Create the zip
        execSync(`cd ${distDir} && zip -r ../module.zip ${includes}`, { stdio: 'inherit' });
        console.log(`Created module.zip with version ${version}`);

    } catch (error) {
        console.error('Error preparing release:', error.message);
        process.exit(1);
    }
}

prepareRelease();
