export class FoundryProxy {

    public get game(): Game {
        return game;
    }

}

export default new FoundryProxy();