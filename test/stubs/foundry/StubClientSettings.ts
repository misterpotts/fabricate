class StubClientSettings {

    private readonly settings: Map<string, Map<string, any>>;

    constructor(settings: Map<string, Map<string, any>> = new Map()) {
        this.settings = settings;
    }

    get(scope: string, key: string): any {
        return this.settings.get(scope)?.get(key);
    }

    set(scope: string, key: string, value: any): void {
        if (!this.settings.has(scope)) {
            this.settings.set(scope, new Map());
        }
        this.settings.get(scope).set(key, value);
    }

}

export { StubClientSettings }

class StubClientSettingsFactory {

    make(settings: Map<string, Map<string, any>> = new Map()): ClientSettings {
        return new StubClientSettings(settings) as unknown as ClientSettings;
    }

}

export { StubClientSettingsFactory }