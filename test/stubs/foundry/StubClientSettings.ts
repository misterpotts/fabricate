class StubClientSettings implements ClientSettings {

    private readonly settings: Map<string, Map<string, any>>;

    constructor(settings: Map<string, Map<string, any>> = new Map()) {
        this.settings = settings;
    }

    get(scope: string, key: string): any {
        return this.settings.get(scope)?.get(key);
    }

    async set(namespace: string, key: string, value: any): Promise<any> {
        if (!this.settings.has(namespace)) {
            this.settings.set(namespace, new Map());
        }
        this.settings.get(namespace).set(key, value);
    }

    get storage(): Map<string, any> {
        throw new Error("Method not implemented.");
    }

    register(_namespace: string, _key: string, _settingConfig: {
        default: any;
        hint: string;
        scope: string;
        name: string;
        type: ObjectConstructor;
        config: boolean;
        choices?: Record<string, string>;
        range?: { min: number; max: number; step: number };
        onChange?: (value: any) => void;
        requiresReload?: boolean
    }): void {
        throw new Error("Method not implemented.");
    }

}

export { StubClientSettings }

class StubClientSettingsFactory {

    make(settings: Map<string, Map<string, any>> = new Map()): ClientSettings {
        return new StubClientSettings(settings) as unknown as ClientSettings;
    }

}

export { StubClientSettingsFactory }