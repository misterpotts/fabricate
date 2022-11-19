const path = require("path");
const fse = require("fs-extra")

const DEFAULT_FVTT_DEV_DATA = "../../dev-data/Data";
const FOUNDRY_MODULE_PATH = "/modules/fabricate";

function foundryDirectoryPath() {
    const devDataDir = process.env.FVTT_DEV_DATA;
    if (devDataDir && devDataDir.length !== 0) {
        return devDataDir.concat(FOUNDRY_MODULE_PATH);
    }
    return DEFAULT_FVTT_DEV_DATA.concat(FOUNDRY_MODULE_PATH);
}

function releaseLocal() {
    const relativePath = foundryDirectoryPath();
    const absolutePath = path.resolve(path.join(__dirname, ".."), relativePath);
    console.log(`Installing to Foundry data dir: "${relativePath}". `);
    fse.copySync("dist", absolutePath);
    console.log(`Installed Fabricate at: "${absolutePath}". `);
}

releaseLocal();