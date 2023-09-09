import {GameProvider} from "../../../src/scripts/foundry/GameProvider";
import {BaseActor} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";

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

    private readonly gameSystemId: string;
    private readonly stubGameObject: StubGameObject;
    private readonly stubActors: Map<string, BaseActor>;

    constructor({
        gameSystemId = "dnd5e",
        stubGameObject = new StubGameObject(),
        stubActors = new Map(),
    }: {
        gameSystemId?: string,
        stubGameObject?: StubGameObject;
        stubActors?: Map<string, BaseActor>,
    } = {}) {
        this.gameSystemId = gameSystemId;
        this.stubGameObject = stubGameObject;
        this.stubActors = stubActors;
    }

    get(): Game {
        return this.stubGameObject as unknown as Game;
    }

    getGameSystemId(): string {
        return this.gameSystemId;
    }

    async loadActor(actorId: string): Promise<BaseActor> {
        return this.stubActors.get(actorId);
    }

}

export { StubGameProvider }