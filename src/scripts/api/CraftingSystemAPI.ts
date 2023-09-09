import {
    DefaultCraftingSystem,
    CraftingSystemJson, CraftingSystem
} from "../system/CraftingSystem";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {EntityValidationResult} from "./EntityValidator";
import {EntityDataStore} from "../repository/EntityDataStore";
import {CraftingSystemValidator} from "../system/CraftingSystemValidator";
import {NotificationService} from "../foundry/NotificationService";
import {CraftingSystemDetails} from "../system/CraftingSystemDetails";

/**
 * CraftingSystemImportData is the data format used when importing crafting systems into Fabricate.
 */
interface CraftingSystemImportData {
    id: string;
    details: {
        name: string;
        summary: string;
        description: string;
        author: string;
    },
    disabled: boolean;
}

export { CraftingSystemImportData }

/**
 * An API for managing crafting systems.
 *
 * @interface
 */
interface CraftingSystemAPI {

    /**
     * Clones a Crafting System by ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the Crafting System to clone.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the newly cloned Crafting System, or rejects with
     *   an Error if the Crafting System is not valid or cannot be cloned.
     */
    cloneById(craftingSystemId: string): Promise<CraftingSystem>;

    /**
     * Creates a new crafting system with the given details. If no details are provided, a default crafting system is
     *  created. The crafting system id is generated automatically.
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
    create({ name, summary, description, author }?: { name?: string, summary?: string, description?: string, author?: string }): Promise<CraftingSystem>;

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
     * Creates or overwrites a crafting system with the given details. This operation is intended to be used when
     *   importing a crafting system from a JSON file. Most users should use `create` or `save` crafting systems
     *   instead.
     *
     * @async
     * @param craftingSystemData - The crafting system data to insert.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the saved crafting system, or rejects with an
     *   error if the crafting system is not valid, or cannot be saved.
     */
    insert(craftingSystemData: CraftingSystemImportData): Promise<CraftingSystem>;

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

    /**
     * Retrieves all crafting systems.
     *
     * @async
     * @returns {Promise<CraftingSystem[]>} A Promise that resolves with all crafting systems.
     */
    getAll(): Promise<Map<string, CraftingSystem>>;

}

export { CraftingSystemAPI };

class DefaultCraftingSystemAPI implements CraftingSystemAPI {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly identityFactory: IdentityFactory;
    private readonly craftingSystemStore: EntityDataStore<CraftingSystemJson, CraftingSystem>;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;
    private readonly craftingSystemValidator: CraftingSystemValidator;

    private readonly user: string;

    constructor({
        identityFactory,
        craftingSystemStore,
        localizationService,
        notificationService,
        craftingSystemValidator = new CraftingSystemValidator(),
        user
    }: {
        identityFactory: IdentityFactory;
        craftingSystemStore: EntityDataStore<CraftingSystemJson, CraftingSystem>;
        localizationService: LocalizationService;
        notificationService: NotificationService;
        craftingSystemValidator?: CraftingSystemValidator;
        user: string;
    }) {
        this.identityFactory = identityFactory;
        this.craftingSystemStore = craftingSystemStore;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
        this.craftingSystemValidator = craftingSystemValidator;
        this.user = user;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async deleteById(id: string): Promise<CraftingSystem | undefined> {
        const craftingSystemToDelete = await this.craftingSystemStore.getById(id);

        this.rejectDeletingEmbeddedCraftingSystem(craftingSystemToDelete);

        if (!craftingSystemToDelete) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.doesNotExist`,
                { craftingSystemId: id }
            );
            this.notificationService.error(message);
            return undefined;
        }

        await this.craftingSystemStore.deleteById(id);

        return craftingSystemToDelete;
    }

    async getById(craftingSystemId: string): Promise<CraftingSystem | undefined> {
        const craftingSystem = await this.craftingSystemStore.getById(craftingSystemId);

        if (!craftingSystem) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.doesNotExist`,
                { craftingSystemId }
            );
            this.notificationService.warn(message);
            return undefined;
        }

        return craftingSystem;
    }

    async cloneById(craftingSystemId: string): Promise<CraftingSystem> {
        const source = await this.getById(craftingSystemId);
        if (!source) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.cloneTargetNotFound`,
                { craftingSystemId }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        const assignedIds = await this.craftingSystemStore.listAllEntityIds();
        const clone = source.clone({
            id: this.identityFactory.make(assignedIds),
            name: `${source.details.name} (Copy)`,
            embedded: false,
        });
        return this.save(clone);
    }

    async getAll(): Promise<Map<string, CraftingSystem>> {
        const allCraftingSystems = await this.craftingSystemStore.getAllEntities();
        return new Map(allCraftingSystems.map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    async save(updatedCraftingSystem: CraftingSystem): Promise<CraftingSystem> {

        const existingCraftingSystem = await this.craftingSystemStore.getById(updatedCraftingSystem.id);

        this.rejectModifyingEmbeddedSystem(existingCraftingSystem, updatedCraftingSystem);
        await this.rejectSavingInvalidSystem(updatedCraftingSystem);

        await this.craftingSystemStore.insert(updatedCraftingSystem);

        const localizationActivity = existingCraftingSystem ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.craftingSystem.${localizationActivity}`,
            { systemName: updatedCraftingSystem.details.name }
        );

        this.notificationService.info(message);

        return updatedCraftingSystem;
    }

    async insert(craftingSystemData: CraftingSystemImportData): Promise<CraftingSystem> {
        const craftingSystem = DefaultCraftingSystem.fromJson({
            ...craftingSystemData,
            embedded: false
        });
        return this.save(craftingSystem);
    }

    async create({
         name = Properties.ui.defaults.craftingSystem.name,
         summary = Properties.ui.defaults.craftingSystem.summary,
         description = Properties.ui.defaults.craftingSystem.description,
         author  = Properties.ui.defaults.craftingSystem.author(this.user)
    }: {
        name?: string;
        summary?: string;
        description?: string;
        author?: string;
    } = {}): Promise<CraftingSystem> {
        const assignedIds = await this.craftingSystemStore.listAllEntityIds();
        const id = this.identityFactory.make(assignedIds);
        const craftingSystemDetails = new CraftingSystemDetails({name, summary, description, author});
        const created = new DefaultCraftingSystem({
            id,
            disabled: true,
            craftingSystemDetails,
            embedded: false
        });
        return this.save(created);
    }

    private async rejectSavingInvalidSystem(craftingSystem: CraftingSystem): Promise<EntityValidationResult<CraftingSystem>> {
        const validationResult = await this.craftingSystemValidator.validate(craftingSystem);
        if (!validationResult.successful) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.invalid`,
                {
                    errors: validationResult.errors.join(", "),
                    craftingSystemId: craftingSystem.id
                }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        return validationResult;
    }

    private rejectDeletingEmbeddedCraftingSystem(craftingSystem: CraftingSystem): void {
        if (!craftingSystem?.isEmbedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.cannotDeleteEmbedded`,
            { craftingSystemName: craftingSystem.details.name }
        );
        this.notificationService.error(message);
        throw new Error(message);

    }

    private rejectModifyingEmbeddedSystem(existingCraftingSystem: CraftingSystem, updatedCraftingSystem: CraftingSystem): void {

        if (!existingCraftingSystem || !existingCraftingSystem.isEmbedded) {
            return;
        }

        if (existingCraftingSystem.equals(updatedCraftingSystem, true)) {
            return;
        }

        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.cannotModifyEmbedded`,
            { craftingSystemName: existingCraftingSystem.details.name }
        );
        this.notificationService.error(message);
        throw new Error(message);

    }

}

export { DefaultCraftingSystemAPI };
