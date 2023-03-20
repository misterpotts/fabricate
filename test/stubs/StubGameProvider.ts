import {GameProvider} from "../../src/scripts/foundry/GameProvider";

class StubGameProvider implements GameProvider {

    private readonly _stubGameObject: Game;

    constructor(stubGameObject: Game) {
        this._stubGameObject = stubGameObject;
    }

    get(): Game {
        return this._stubGameObject;
    }

}

export { StubGameProvider }