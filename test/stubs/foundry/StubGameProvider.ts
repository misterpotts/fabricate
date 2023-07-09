import {GameProvider} from "../../../src/scripts/foundry/GameProvider";

class StubGameObject {

    get i18n() {
        return {
            localize: (path: string) => path,
            format: (path: string, _params: {}) => path
        }
    }

}

export { StubGameObject }

class StubGameProvider implements GameProvider {

    private readonly stubGameObject: StubGameObject;

    constructor() {
        this.stubGameObject = new StubGameObject();
    }

    get(): Game {
        return this.stubGameObject as unknown as Game;
    }

}

export { StubGameProvider }