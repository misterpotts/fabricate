import {HashProvider} from "../../../src/scripts/patreon/HashProvider";

class StubHashProvider implements HashProvider {

    private readonly _hashes: Map<string, string>;

    constructor(hashes: Map<string, string> = new Map()) {
        this._hashes = hashes;
    }

    async hash(data: string): Promise<string> {
        if (!this._hashes.has(data)) {
            this._hashes.set(data, this.randomHash());
        }
        return this._hashes.get(data);
    }

    randomHash(): string {
        return (Math.random() + 1)
            .toString(36)
            .substring(2);
    }

}

export { StubHashProvider }