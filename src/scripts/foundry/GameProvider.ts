interface GameProvider {

    get(): Game;

    getGameSystemId(): string;

    loadActor(actorId: string): Promise<Actor>;

}

export { GameProvider }

class DefaultGameProvider implements GameProvider {

    get(): Game {
        if (!game) {
            throw new Error(`Game object not yet initialised. Wait for the Foundry 'init' hook before calling this method`);
        }
        return <Game>game;
    }

    getGameSystemId(): string {
        return this.get().system.id;
    }

    async loadActor(actorId: string): Promise<Actor> {
        const actor = this.get().actors.get(actorId);
        if (!actor) {
            throw new Error(`Actor with id ${actorId} not found`);
        }
        return actor;
    }

}

export { DefaultGameProvider }