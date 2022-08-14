import { describe, expect, test, jest } from '@jest/globals';
import * as Sinon from "sinon";
import * as fs from 'fs/promises';

import {CraftingSystemFactory} from "../src/scripts/system/CraftingSystemFactory";
import {CraftingSystemSpecification} from "../src/scripts/system/specification/CraftingSystemSpecification";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    jest.resetAllMocks();
    Sandbox.reset();
});

describe('A Crafting System Factory', () => {

    test('should create a new Crafting System from a valid specification', async () => {
        const rawData = await fs.readFile('./src/resources/alchemists-supplies-v16-system-spec.json', {encoding: 'utf8'});
        expect(rawData).not.toBeNull();
        const jsonData = JSON.parse(rawData);
        console.log(jsonData);
        const systemSpec: CraftingSystemSpecification = <CraftingSystemSpecification> jsonData;

        const underTest: CraftingSystemFactory = new CraftingSystemFactory(systemSpec);
    });

});
