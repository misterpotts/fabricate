import Properties from "../Properties";

interface SettingManager<T> {

    readonly settingPath: string;

    read(): Promise<T>;

    write(value: T): Promise<void>;

    delete(): Promise<T>;

}

export { SettingManager }

class DefaultSettingManager<T> implements SettingManager<T> {

    private readonly moduleId: string;
    private readonly _settingKey: string;
    private readonly clientSettings: ClientSettings;

    constructor({
        moduleId = Properties.module.id,
        settingKey,
        clientSettings
    }: {
        moduleId?: string;
        settingKey: string;
        clientSettings: ClientSettings;
    }) {
        this.moduleId = moduleId;
        this._settingKey = settingKey;
        this.clientSettings = clientSettings;
    }

    get settingPath(): string {
        return `${this.moduleId}.${this._settingKey}`;
    }

    async delete(): Promise<T> {
        const setting = this.clientSettings.storage.get("world").getSetting(this.settingPath);
        await setting.delete();
        return setting;
    }

    async read(): Promise<T> {
        return this.clientSettings.get(this.moduleId, this._settingKey) as T;
    }

    async write(writeValue: T): Promise<void> {
        await this.clientSettings.set(this.moduleId, this._settingKey, writeValue);
        return;
    }

}

export { DefaultSettingManager }