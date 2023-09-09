import {UI, UIProvider} from "../../../src/scripts/foundry/UIProvider";

class StubUIObject implements UI {

    private readonly _notifications: {
        error: () => void;
        info: () => void;
        warn: () => void;
    };

    constructor() {
        this._notifications = {
            error: () => {},
            info: () => {},
            warn: () => {}
        }
    }

    get notifications() {
        return this._notifications;
    }

}

export { StubUIObject }

class StubUIProvider implements UIProvider {

    private readonly stubUIObject: StubUIObject;

    constructor() {
        this.stubUIObject = new StubUIObject();
    }

    get(): UI {
        return this.stubUIObject as unknown as UI;
    }

}

export { StubUIProvider }