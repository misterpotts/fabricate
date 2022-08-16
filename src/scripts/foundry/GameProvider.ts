class GameProvider {

    public globalGameObject(): Game {
        if (game ! instanceof Game) {
            throw new Error("Game object not yet initialised. " +
                "Wait for the `'init'` hook event before calling this method");
        }
        return <Game> game;
    }

}