import {jest} from "@jest/globals";

class MockCompendium {
    _entities: Map<string, any> = new Map();

    constructor(initialEntries: [string, any][]) {
        this._entities = new Map(initialEntries);
    }

    __setEntity(id: string, entity: any) {
        this._entities.set(id, entity);
    }

    getEntity(id: string) {
        return this._entities.get(id);
    }
}

const mockPacks: Map<string, MockCompendium> = new Map();

const __mockCompendiumEntry = (pack: string, entryId: string, entry: any) => {
    if (mockPacks.has(pack)) {
        return mockPacks.get(pack).__setEntity(entryId, entry);
    }
    mockPacks.set(pack, new MockCompendium([[entryId, entry]]));
}

const mockGame = {
    packs: mockPacks
};

const mockProxy = jest.createMockFromModule('./FoundryProxy');

// @ts-ignore
mockProxy.game = mockGame;
// @ts-ignore
mockProxy.__mockCompendiumEntry = __mockCompendiumEntry;

export default mockProxy;