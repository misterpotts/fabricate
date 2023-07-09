interface UI {
    notifications: {
        warn: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
    }
}

export { UI }

interface UIProvider {

    get(): UI;

}

export { UIProvider }

class DefaultUIProvider implements UIProvider {

    get(): UI {
        if (!ui) {
            throw new Error(`UI object not yet initialised. 
                Wait for the Foundry 'init' hook before calling this method`);
        }
        return <UI>ui;
    }

}

export { DefaultUIProvider }