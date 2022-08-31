const { series, parallel, src, dest } = require('gulp');
const less = require('gulp-less');
const jest = require('gulp-jest').default;
const webpack = require('webpack-stream');
const webpack_config = require('./webpack.config.js');
const log = require('fancy-log');
const { resolve } = require('path');

function compileTypescript() {
    return src('src/**/*.ts')
        .pipe(webpack(webpack_config))
        .pipe(dest('dist/'));
}

function compileLess() {
    return src('src/styles/**')
        .pipe(less())
        .pipe(dest('dist/styles/'));
}

const compile = parallel(compileTypescript, compileLess);

exports.compile = compile;

function runTestsWithCoverage() {
    return src('test/**/*test.ts')
        .pipe(jest({
            preprocessorIgnorePatterns: [
                "<rootDir>/dist/", "<rootDir>/node_modules/"
            ],
            coverage: true,
            collectCoverageFrom: [
                '**/*.{ts,tsx}',
                '!**/node_modules/**',
                '!**/vendor/**',
            ],
            coverageDirectory: "coverage",
            coverageThreshold: {
                branches: 70,
                functions: 70,
                lines: 70,
                statements: 70,
            },
            automock: false,
            reporters: ['default', 'github-actions']
        }));
}

exports.coverageTest = runTestsWithCoverage;

function runTests() {
    return src('test/**/*test.ts')
        .pipe(jest());
}

exports.test = runTests;

function copyReadme() {
    return src('README.md')
        .pipe(dest("dist/"));
}

function copyManifest() {
    return src("src/module.json")
        .pipe(dest('dist/'));
}

function copyCompendiumPacks() {
    return src("src/packs/**")
        .pipe(dest('dist/packs'));
}

function copyLanguages() {
    return src("src/lang/*.json")
        .pipe(dest('dist/lang/'));
}

function copyTemplates() {
    return src("src/templates/**.hbs")
        .pipe(dest('dist/templates/'));
}

function copyStyles() {
    return src("src/styles/!**/!*.css")
        .pipe(dest('dist/styles/'));
}

function copyAssets() {
    return src("src/assets/!**")
        .pipe(dest('dist/assets/'));
}

const copy = parallel(
    copyReadme,
    copyManifest,
    copyCompendiumPacks,
    copyLanguages,
    copyTemplates,
    copyStyles,
    copyAssets
);

exports.copy = copy;

const build = series(runTests, compile, copy);

exports.build = build;

const DEFAULT_FVTT_DEV_DATA = "../../dev-data/Data";
const FOUNDRY_MODULE_PATH = "/modules/fabricate";

function foundryDirectoryPath(): string {
    const devDataDir: string = process.env.FVTT_DEV_DATA;
    if (devDataDir && devDataDir.length !== 0) {
        return devDataDir.concat(FOUNDRY_MODULE_PATH);
    }
    return DEFAULT_FVTT_DEV_DATA.concat(FOUNDRY_MODULE_PATH);
}

function localInstall() {
    const relativePath = foundryDirectoryPath();
    const absolutePath = resolve(__dirname, relativePath);
    log(`Installing to Foundry data dir: "${relativePath}". `);
    return src('dist/**')
        .pipe(dest(relativePath))
        .on('end', () => log(`Installed Fabricate at: "${absolutePath}". `));
}

const deploy = series(build, localInstall);

exports.deploy = deploy;

exports.default = build;
