import {PartDictionary, PartDictionaryLoader} from "../../src/scripts/system/PartDictionary";

class StubPartDictionaryLoader implements PartDictionaryLoader {

    constructor() {}

    load(_partDictionary: PartDictionary): Promise<void> {
        return Promise.resolve(null);
    }


}

export { StubPartDictionaryLoader }