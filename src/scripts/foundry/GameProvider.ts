class GameProvider {

    public globalGameObject(): Game {
        if (!("ready" in game && game.ready)) {
            throw new Error("Game object not yet initialised. " +
                "Wait for the `'ready'` hook event before calling this method");
        }
        return <Game> game;
    }

}

export { GameProvider }