interface GameProvider {

    get(): Game;

}

export { GameProvider }

class DefaultGameProvider implements GameProvider {

    get(): Game {
        if (!game) {
            throw new Error(`Game object not yet initialised. 
                Wait for the Foundry 'init' hook before calling this method`);
        }
        return <Game>game;
    }

}

export { DefaultGameProvider }