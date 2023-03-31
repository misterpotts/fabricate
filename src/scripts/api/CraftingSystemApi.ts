import {
    CraftingSystem,
    CraftingSystemJson,
    CraftingSystemValidator, EmbeddedCraftingSystem,
    UserDefinedCraftingSystem
} from "../system/CraftingSystem";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {SettingManager} from "./SettingManager";
import {CraftingSystemDetails} from "../system/CraftingSystemDetails";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {ALCHEMISTS_SUPPLIES_SYSTEM_DATA as ALCHEMISTS_SUPPLIES} from "../system/bundled/AlchemistsSuppliesV16";

interface CraftingSystemData {
    systemsById: Record<string, CraftingSystemJson>;

}

export { CraftingSystemData }

/**
 * An API for managing crafting systems.
 *
 * @interface
 */
interface CraftingSystemApi {

    /**
     * Creates a new crafting system with the given details.
     *
     * @async
     * @param {object} options - The crafting system details.
     * @param {string} [options.name] - The name of the crafting system.
     * @param {string} [options.summary] - A brief summary of the crafting system.
     * @param {string} [options.description] - A more detailed description of the crafting system.
     * @param {string} [options.author] - The name of the person or organization that authored the crafting system.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the newly created `CraftingSystem` instance, or
     *  rejects with an Error if the crafting system is not valid.
     */
    create({ name, summary, description, author }: { name: string, summary: string, description?: string, author: string }): Promise<CraftingSystem>;

    /**
     * Returns all crafting systems.
     *
     * @returns {Promise<Map<string, CraftingSystem>>} A promise that resolves to a Map of CraftingSystem instances,
     * where the keys are the crafting system IDs, or rejects with an Error is the settings cannot be read.
     */
    getAll(): Promise<Map<string, CraftingSystem>>;

    /**
     * Retrieves the crafting system with the specified ID.
     *
     * @param {string} id - The ID of the crafting system to retrieve.
     * @returns {Promise<CraftingSystem | undefined>} A Promise that resolves with the crafting system, or undefined if
     *  it does not exist.
     */
    getById(id: string): Promise<CraftingSystem | undefined>;

    /**
     * Saves a crafting system.
     *
     * @async
     * @param {CraftingSystem} craftingSystem - The crafting system to save.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the saved crafting system, or rejects with an
     *  error if the crafting system is not valid, or cannot be saved.
     */
    save(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    /**
     * Deletes a crafting system by ID.
     *
     * @async
     * @param {string} id - The ID of the crafting system to delete.
     * @returns {Promise<CraftingSystem | undefined>} - A Promise that resolves to the deleted crafting system or
     *  undefined if the crafting system with the given ID does not exist.
     */
    deleteById(id: string): Promise<CraftingSystem | undefined>;

    /**
     * The Notification service used by this API. If `notifications.isSuppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    notifications: NotificationService;

}

export { CraftingSystemApi };

class DefaultCraftingSystemApi implements CraftingSystemApi {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly identityFactory: IdentityFactory;
    private readonly settingManager: SettingManager<CraftingSystemData>;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;
    private readonly craftingSystemValidator: CraftingSystemValidator;
    private readonly gameSystem: string;

    constructor({
        identityFactory,
        settingManager,
        localizationService,
        notificationService,
        craftingSystemValidator = new CraftingSystemValidator(),
        gameSystem
    }: {
        identityFactory: IdentityFactory;
        settingManager: SettingManager<CraftingSystemData>;
        localizationService: LocalizationService;
        notificationService: NotificationService;
        craftingSystemValidator?: CraftingSystemValidator;
        gameSystem: string;
    }) {
        this.identityFactory = identityFactory;
        this.settingManager = settingManager;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
        this.craftingSystemValidator = craftingSystemValidator;
        this.gameSystem = gameSystem;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async deleteById(id: string): Promise<CraftingSystem | undefined> {
        const settingValue = await this.settingManager.read();
        if (!settingValue.systemsById[id]) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemApi._LOCALIZATION_PATH}.errors.craftingSystem.doesNotExist`,
                { craftingSystemId: id }
            );
            this.notificationService.error(message);
            return undefined;
        }
        const {details, enabled} = settingValue.systemsById[id];
        const craftingSystemDetails = new CraftingSystemDetails(details);
        const deletedCraftingSystem = new UserDefinedCraftingSystem({
            id,
            enabled,
            craftingSystemDetails: craftingSystemDetails
        });
        delete settingValue.systemsById[id];
        await this.settingManager.write(settingValue);
        return deletedCraftingSystem;
    }

    async getAll(): Promise<Map<string, CraftingSystem>> {
        const settingValue = await this.settingManager.read();
        const systemIds = Object.keys(settingValue.systemsById);
        const allSystems = Array.from(systemIds)
            .map(id => this.buildCraftingSystem(id, settingValue.systemsById[id]))
            .concat(this.getEmbeddedCraftingSystems());
        return new Map(allSystems.map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    async getById(craftingSystemId: string): Promise<CraftingSystem | undefined> {
        const embeddedSystem = this.getEmbeddedCraftingSystems().find(embeddedSystem => embeddedSystem.id === craftingSystemId);
        if (embeddedSystem) {
            return embeddedSystem;
        }
        const settingValue = await this.settingManager.read();
        const craftingSystemJson = settingValue.systemsById[craftingSystemId];
        if (!craftingSystemJson) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemApi._LOCALIZATION_PATH}.errors.craftingSystem.doesNotExist`,
                { craftingSystemId }
            );
            this.notificationService.warn(message);
            return undefined;
        }
        return this.buildCraftingSystem(craftingSystemId, craftingSystemJson);
    }

    private buildCraftingSystem(id: string, craftingSystemJson: CraftingSystemJson, embedded = false): CraftingSystem {
        const {details, enabled} = craftingSystemJson;
        const craftingSystemDetails = new CraftingSystemDetails(details);
        if (!embedded) {
            return new UserDefinedCraftingSystem({
                id,
                enabled,
                craftingSystemDetails
            });
        }
        return new EmbeddedCraftingSystem({
            id,
            enabled,
            craftingSystemDetails
        });
    }

    async save(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        this.rejectSavingEmbeddedSystem(craftingSystem);
        await this.rejectSavingInvalidSystem(craftingSystem);
        const craftingSystemData = await this.settingManager.read();
        let localizationActivity = !!craftingSystemData.systemsById[craftingSystem.id] ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultCraftingSystemApi._LOCALIZATION_PATH}.settings.craftingSystem.${localizationActivity}`,
            { craftingSystemName: craftingSystem.details.name }
        );
        craftingSystemData.systemsById[craftingSystem.id] = craftingSystem.toJson();
        await this.settingManager.write(craftingSystemData);
        this.notificationService.info(message);
        return craftingSystem;
    }

    private async rejectSavingInvalidSystem(craftingSystem: CraftingSystem) {
        const validationResult = await this.craftingSystemValidator.validate(craftingSystem);
        if (!validationResult.isSuccessful) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemApi._LOCALIZATION_PATH}.errors.craftingSystem.notValid`,
                { errors: validationResult.errors.join(", ") }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
    }

    private rejectSavingEmbeddedSystem(craftingSystem: CraftingSystem) {
        const embeddedSystemIds = this.getEmbeddedCraftingSystems().map(embedded => embedded.id);
        if (embeddedSystemIds.includes(craftingSystem.id)) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemApi._LOCALIZATION_PATH}.errors.craftingSystem.reservedId`,
                {craftingSystemId: craftingSystem.id}
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
    }

    async create({ name, summary, description, author }: { name?: string, summary?: string, description?: string, author?: string } = {}): Promise<CraftingSystem> {
        const settingValue = this.settingManager.read();
        const assignedIds = Object.keys(settingValue);
        const id = this.identityFactory.make(assignedIds);
        const craftingSystemDetails = new CraftingSystemDetails({name, summary, description, author});
        const created = new UserDefinedCraftingSystem({
            id,
            enabled: true,
            craftingSystemDetails
        });
        return this.save(created);
    }

    private getEmbeddedCraftingSystems(): CraftingSystem[] {
        const bundledSystems = [ALCHEMISTS_SUPPLIES];
        return bundledSystems.filter(bundledSystem => !bundledSystem.gameSystem || bundledSystem.gameSystem === this.gameSystem)
            .map(bundledSystem => this.buildCraftingSystem(bundledSystem.id, bundledSystem.definition, true));
    }

}

export { DefaultCraftingSystemApi };
