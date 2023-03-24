import Properties from "../Properties";
import {LocalizationService} from "../../applications/common/LocalizationService";

interface SettingValidator<T> {

    validate(value: T): SettingValidationResult<T>;

}

interface SettingValidationResult<T> {

    errors: string[];

    isSuccessful: boolean;

    value: T;

}

interface SettingManager<T> {

    read(): T;

    write(value: T): Promise<void>;

    delete(): Promise<T>;

}

class DefaultSettingManager<T> implements SettingManager<T> {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly _moduleId: string;
    private readonly _settingKey: string;
    private readonly _settingValidator: SettingValidator<T>;
    private readonly _clientSettings: ClientSettings;
    private readonly _notifications: Notifications;
    private readonly _localizationService: LocalizationService;

    constructor({
        moduleId = Properties.module.id,
        settingKey,
        settingValidator,
        clientSettings,
        notifications,
        localizationService
    }: {
        moduleId?: string;
        settingKey: string;
        settingValidator: SettingValidator<T>;
        clientSettings: ClientSettings;
        notifications: Notifications;
        localizationService: LocalizationService;
    }) {
        this._moduleId = moduleId;
        this._settingKey = settingKey;
        this._settingValidator = settingValidator;
        this._clientSettings = clientSettings;
        this._notifications = notifications;
        this._localizationService = localizationService;
    }

    async delete(): Promise<T> {
        const setting = this._clientSettings.storage.get("world").getSetting(`${this._moduleId}.${this._settingKey}`);
        await setting.delete();
        const message = this._localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.settingDeleted`,
            {
                settingPath: this._settingKey
            });
        this._notifications.warn(message);
        return setting;
    }

    read(): T {
        const readValue = this._clientSettings.get(this._moduleId, this._settingKey) as T;
        const validationResult = this._settingValidator.validate(readValue);
        if (validationResult.isSuccessful) {
            return validationResult.value;
        }
        const message = this._localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.errors.invalidRead`,
            {
                settingPath: this._settingKey,
                errors: validationResult.errors.join(", ")
            });
        this._notifications.error(message);
    }

    async write(writeValue: T): Promise<void> {
        const validationResult = this._settingValidator.validate(writeValue);
        if (validationResult.isSuccessful) {
            await this._clientSettings.set(this._moduleId, this._settingKey, validationResult.value);
            return;
        }
        const message = this._localizationService.format(
            `${DefaultSettingManager._LOCALIZATION_PATH}.errors.invalidWrite`,
            {
                settingPath: this._settingKey,
                errors: validationResult.errors.join(", ")
            });
        this._notifications.error(message);
    }

}

export { SettingManager, DefaultSettingManager }