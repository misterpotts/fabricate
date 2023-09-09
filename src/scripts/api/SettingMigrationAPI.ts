import {SettingVersion} from "../repository/migration/SettingVersion";
import {SettingMigrationResult} from "./SettingMigrationResult";
import {SettingsMigrator} from "../repository/migration/SettingsMigrator";
import {NotificationService} from "../foundry/NotificationService";
import {SettingMigrationStatus} from "../repository/migration/SettingMigrationStatus";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {EmbeddedCraftingSystemManager} from "../repository/embedded_systems/EmbeddedCraftingSystemManager";
import {SettingsRegistry} from "../repository/SettingsRegistry";

interface SettingMigrationAPI {

    /**
     * Migrate all settings to the latest version.
     *
     * @async
     * @returns The result of the settings migration.
     */
    migrateAll(): Promise<SettingMigrationResult>;

    /**
     * Get the target version of Fabricate's settings.
     *
     * @returns The target version of Fabricate's settings.
     */
    getTargetVersion(): SettingVersion;

    /**
     * Get the current version of Fabricate's settings.
     *
     * @async
     * @returns The current version of Fabricate's settings.
     */
    getCurrentVersion(): Promise<SettingVersion>;

    /**
     * Determines whether a setting migration is needed for one or more settings.
     *
     * @async
     * @returns True if a setting migration is needed, false otherwise.
     */
    isMigrationNeeded(): Promise<boolean>;

    /**
     * Restores the embedded crafting systems to their default values. Use this function to recover lost or corrupted
     *   embedded crafting systems.
     *
     * @async
     */
    restoreEmbeddedCraftingSystems(): Promise<void>;

    /**
     * WARNING: This function will remove all user-defined crafting systems and restore the embedded crafting systems to
     *  their default values. Do not use this function unless you are absolutely sure you want to delete all of your
     *  crafting systems.
     */
    clear(): Promise<void>;

}

export { SettingMigrationAPI }

class DefaultSettingMigrationAPI implements SettingMigrationAPI {

    private readonly _gameSystemId: string;
    private readonly _settingsMigrator: SettingsMigrator;
    private readonly _settingsRegistry: SettingsRegistry;
    private readonly _localizationService: LocalizationService;
    private readonly _notificationService: NotificationService;
    private readonly _embeddedCraftingSystemManager: EmbeddedCraftingSystemManager;

    constructor({
        gameSystemId,
        settingsMigrator,
        settingsRegistry,
        localizationService,
        notificationService,
        embeddedCraftingSystemManager
    }: {
        gameSystemId: string;
        settingsMigrator: SettingsMigrator;
        settingsRegistry: SettingsRegistry;
        localizationService: LocalizationService;
        notificationService: NotificationService;
        embeddedCraftingSystemManager: EmbeddedCraftingSystemManager;
    }) {
        this._gameSystemId = gameSystemId;
        this._settingsMigrator = settingsMigrator;
        this._settingsRegistry = settingsRegistry;
        this._localizationService = localizationService;
        this._notificationService = notificationService;
        this._embeddedCraftingSystemManager = embeddedCraftingSystemManager;
    }

    getCurrentVersion(): Promise<SettingVersion> {
        return this._settingsMigrator.getModelVersion();
    }


    getTargetVersion(): SettingVersion {
        return this._settingsMigrator.targetVersion;
    }

    async isMigrationNeeded(): Promise<boolean> {
        return this._settingsMigrator.isMigrationNeeded();
    }

    async migrateAll(): Promise<SettingMigrationResult> {
        const startedMessage = this._localizationService.localize(`${Properties.module.id}.settings.migration.started`);
        this._notificationService.info(startedMessage);
        const migrationResult = await this._settingsMigrator.performMigration();
        await this.restoreEmbeddedCraftingSystems();
        const outcomeMessage = this._localizationService.localize(this._getLocalizationMessagePathBySettingMigrationStatus(migrationResult.status));
        this._notificationService.info(outcomeMessage);
        return migrationResult;
    }

    private _getLocalizationMessagePathBySettingMigrationStatus(status: SettingMigrationStatus): string {
        switch (status) {
            case SettingMigrationStatus.NOT_NEEDED:
                return `${Properties.module.id}.settings.migration.notNeeded`;
            case SettingMigrationStatus.SUCCESS:
                return `${Properties.module.id}.settings.migration.success`;
            case SettingMigrationStatus.FAILURE:
                return `${Properties.module.id}.settings.migration.failed`;
            default:
                throw new Error(`No localization message path found for setting migration status ${status}.`);
        }
    }

    async restoreEmbeddedCraftingSystems(): Promise<void> {
        await this._embeddedCraftingSystemManager.restoreForGameSystem(this._gameSystemId);
    }

    async clear(): Promise<void> {
        await this._settingsRegistry.clearAll();
        await this.restoreEmbeddedCraftingSystems();
    }

}

export { DefaultSettingMigrationAPI }