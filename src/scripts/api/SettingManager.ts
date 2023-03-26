import Properties from "../Properties";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {EntityValidator} from "./EntityValidator";

interface SettingManager<T> {

    read(): Promise<T>;

    write(value: T): Promise<void>;

    delete(): Promise<T>;

}

export { SettingManager }

class DefaultSettingManager<T> implements SettingManager<T> {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly moduleId: string;
    private readonly settingKey: string;
    private readonly settingValidator: EntityValidator<T>;
    private readonly clientSettings: ClientSettings;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;

    constructor({
        moduleId = Properties.module.id,
        settingKey,
        settingValidator,
        clientSettings,
        notificationService,
        localizationService
    }: {
        moduleId?: string;
        settingKey: string;
        settingValidator: EntityValidator<T>;
        clientSettings: ClientSettings;
        notificationService: NotificationService;
        localizationService: LocalizationService;
    }) {
        this.moduleId = moduleId;
        this.settingKey = settingKey;
        this.settingValidator = settingValidator;
        this.clientSettings = clientSettings;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
    }

    async delete(): Promise<T> {
        const setting = this.clientSettings.storage.get("world").getSetting(`${this.moduleId}.${this.settingKey}`);
        await setting.delete();
        const message = this.localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.settingDeleted`,
            {
                settingPath: this.settingKey
            });
        this.notificationService.warn(message);
        return setting;
    }

    async read(): Promise<T> {
        const readValue = this.clientSettings.get(this.moduleId, this.settingKey) as T;
        const validationResult = await this.settingValidator.validate(readValue);
        if (validationResult.isSuccessful) {
            return validationResult.entity;
        }
        const message = this.localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.errors.invalidRead`,
            {
                settingPath: this.settingKey,
                errors: validationResult.errors.join(", ")
            });
        this.notificationService.error(message);
        throw new Error(message);
    }

    async write(writeValue: T): Promise<void> {
        const validationResult = await this.settingValidator.validate(writeValue);
        if (validationResult.isSuccessful) {
            await this.clientSettings.set(this.moduleId, this.settingKey, validationResult.entity);
            return;
        }
        const message = this.localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.errors.invalidWrite`,
            {
                settingPath: this.settingKey,
                errors: validationResult.errors.join(", ")
            });
        this.notificationService.error(message);
        throw new Error(message);
    }

}

export { DefaultSettingManager }