import {
    CraftingSystem,
    CraftingSystemJson
} from "../system/CraftingSystem";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {CraftingSystemDetails} from "../system/CraftingSystemDetails";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {EntityValidationResult} from "./EntityValidator";
import {EntityDataStore} from "../repository/EntityDataStore";
import {CraftingSystemValidator} from "../system/CraftingSystemValidator";
import {NotificationService} from "../foundry/NotificationService";

/**
 * An API for managing crafting systems.
 *
 * @interface
 */
interface CraftingSystemAPI {

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
    create({ name, summary, description, author }: { name?: string, summary?: string, description?: string, author?: string }): Promise<CraftingSystem>;

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

    async getAll(): Promise<Map<string, CraftingSystem>> {
        const allCraftingSystems = await this.craftingSystemStore.getAllEntities();
        return new Map(allCraftingSystems.map(craftingSystem => [craftingSystem.id, craftingSystem]));
    }

    async save(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const existing = await this.craftingSystemStore.getById(craftingSystem.id);

        this.rejectModifyingEmbeddedSystem(existing);
        await this.rejectSavingInvalidSystem(craftingSystem);

        await this.craftingSystemStore.insert(craftingSystem);

        const localizationActivity = existing ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.settings.craftingSystem.${localizationActivity}`,
            { craftingSystemName: craftingSystem.details.name }
        );

        this.notificationService.info(message);

        return craftingSystem;
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
        const created = new CraftingSystem({
            id,
            enabled: true,
            craftingSystemDetails,
            embedded: false
        });
        return this.save(created);
    }

    private async rejectSavingInvalidSystem(craftingSystem: CraftingSystem): Promise<EntityValidationResult<CraftingSystem>> {
        const validationResult = await this.craftingSystemValidator.validate(craftingSystem);
        if (!validationResult.successful) {
            const message = this.localizationService.format(
                `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.notValid`,
                { errors: validationResult.errors.join(", ") }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        return validationResult;
    }

    private rejectDeletingEmbeddedCraftingSystem(craftingSystem: CraftingSystem): void {
        if (!craftingSystem?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.cannotDeleteEmbedded`,
            { craftingSystemName: craftingSystem.details.name }
        );
        this.notificationService.error(message);
        throw new Error(message);

    }

    private rejectModifyingEmbeddedSystem(craftingSystem: CraftingSystem): void {
        if (!craftingSystem?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultCraftingSystemAPI._LOCALIZATION_PATH}.errors.craftingSystem.canNotModifyEmbedded`,
            { craftingSystemName: craftingSystem.details.name }
        );
        this.notificationService.error(message);
        throw new Error(message);

    }

}

export { DefaultCraftingSystemAPI };
