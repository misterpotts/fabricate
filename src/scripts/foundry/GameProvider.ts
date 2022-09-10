import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";

class GameProvider {

    public globalGameObject(): Game {
        if (!game) {
            throw new Error("Game object not yet initialised. " +
                "Wait for the 'init' hook event before calling this method");
        }
        return <Game> game;
    }

    public async getDocumentById(id: string): Promise<Document<any>> {
        return await fromUuid(id);
    }

}

export { GameProvider }