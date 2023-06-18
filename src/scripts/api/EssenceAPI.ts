import {Essence, EssenceJson} from "../crafting/essence/Essence";
import Properties from "../Properties";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {EntityDataStore} from "./EntityDataStore";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {EntityValidationResult, EntityValidator} from "./EntityValidator";
import {CraftingSystemAPI} from "./CraftingSystemAPI";

/**
 * Represents a set of options for creating an essence.
 */
interface EssenceCreationOptions {

    /**
     * The name of the essence.
     */
    name: string;

    /**
     * The tooltip text to display when the essence is hovered over.
     */
    tooltip?: string;

    /**
     * The FontAwesome icon code for the essence icon
     */
    iconCode?: string;

    /**
     * A more detailed description of the essence
     */
    description?: string;

    /**
     * The UUID of the item that is the source of the active effect for this essence, if present
     */
    activeEffectSourceItemUuid?: string;

    /**
     * The ID of the crafting system to which this essence belongs.
     */
    craftingSystemId: string;

}

export { EssenceCreationOptions };

interface EssenceAPI {

    /**
     * Retrieves the essence with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the essence to retrieve.
     * @returns {Promise<Essence | undefined>} A Promise that resolves with the essence, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Essence | undefined>;

    /**
     * Returns all essences.
     *
     * @async
     * @returns {Promise<Map<string, Essence>>} A Promise that resolves to a Map of all essences, where the keys are
     *   the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Essence>>;

    /**
     * Returns all essences with the specified IDs.
     *
     * @param {string[]} essenceIds - An array of essence IDs to retrieve.
     * @returns {Promise<Map<string, Essence | undefined>>} A Promise that resolves to a Map of essences, where the keys
     *   are the essence IDs. Values are undefined if the essence with the corresponding ID does not exist.
     */
    getAllById(essenceIds: string[]): Promise<Map<string, Essence | undefined>>;

    /**
     * Returns all essences for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of essence instances for the given
     * crafting system, where the keys are the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>>;

    /**
     * Deletes an essence by ID.
     *
     * @async
     * @param {string} id - The ID of the essence to delete.
     * @returns {Promise<Essence | undefined>} - A Promise that resolves to the deleted essence or undefined if the
     *   essence with the given ID does not exist.
     */
    deleteById(id: string): Promise<Essence | undefined>;

    /**
     * Deletes all essences by item UUID.
     *
     * @async
     * @param itemUuid
     * @returns {Promise<Essence | undefined>} - A Promise that resolves to the deleted essence(s) or an empty array if
     *   no essences were deleted.
     */
    deleteByItemUuid(itemUuid: string): Promise<Essence[]>;

    /**
     * Deletes all essences by crafting system ID.
     *
     * @async
     * @param craftingSystemId - The ID of the crafting system to which the essences belong.
     * @returns {Promise<Essence[]>} - A Promise that resolves to the deleted essence(s) or an empty array if no
     *   essences were deleted.
     */
    deleteByCraftingSystemId(craftingSystemId: string): Promise<Essence[]>;

    /**
     * Creates a new essence with the given details.
     *
     * @async
     * @param {object} options - The options to use when creating the essence
     * @param {string} [options.name] - The name of the essence
     * @param {string} [options.tooltip] - The tooltip text to display when the essence is hovered over
     * @param {string} [options.iconCode] - The FontAwesome icon code for the essence icon
     * @param {string} [options.description] - A more detailed description of the essence
     * @param {string} [options.activeEffectSourceItemUuid] - The UUID of the item that is the source of the active
     *   effect for this essence, if present
     * @returns {Promise<Essence>} A Promise that resolves to the created essence.
     */
    create({ name, tooltip, iconCode, description, activeEffectSourceItemUuid, craftingSystemId }: EssenceCreationOptions): Promise<Essence>;

    /**
     * Saves the given essence.
     *
     * @async
     * @param {Essence} essence - The essence to save.
     * @returns {Promise<Essence>} A Promise that resolves to the saved essence.
     */
    save(essence: Essence): Promise<Essence>;

    /**
     * The Notification service used by this API. If `notifications.suppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    readonly notifications: NotificationService;

}

export { EssenceAPI };

class DefaultEssenceAPI implements EssenceAPI {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly identityFactory: IdentityFactory;
    private readonly essenceStore: EntityDataStore<EssenceJson, Essence>;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;
    private readonly essenceValidator: EntityValidator<EssenceJson, Essence>;

    constructor({
        identityFactory,
        essenceStore,
        localizationService,
        notificationService,
        essenceValidator
    }: {
        identityFactory: IdentityFactory;
        essenceStore: EntityDataStore<EssenceJson, Essence>;
        localizationService: LocalizationService;
        notificationService: NotificationService;
        essenceValidator: EntityValidator<EssenceJson, Essence>;
        craftingSystemAPI: CraftingSystemAPI;
    }) {
        this.identityFactory = identityFactory;
        this.essenceStore = essenceStore;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
        this.essenceValidator = essenceValidator;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async getById(id: string): Promise<Essence | undefined> {
        const essence = await this.essenceStore.getById(id);

        if (!essence) {
            const message = this.localizationService.format(
                `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.doesNotExist`,
                { essenceId: id }
            );
            this.notificationService.warn(message);
            return undefined;
        }

        return essence;
    }

    async create({
        name,
        tooltip = name,
        iconCode = Properties.ui.defaults.essence.iconCode,
        description = Properties.ui.defaults.essence.description,
        activeEffectSourceItemUuid,
        craftingSystemId
   }: EssenceCreationOptions): Promise<Essence> {
        const assignedIds = await this.essenceStore.listAllEntityIds();
        const id = this.identityFactory.make(assignedIds);
        return this.essenceStore.create({
            id,
            name,
            tooltip,
            iconCode,
            description,
            embedded: false,
            craftingSystemId,
            activeEffectSourceItemUuid,
        });
    }

    async deleteById(id: string): Promise<Essence | undefined> {
        const essenceToDelete = await this.essenceStore.getById(id);

        this.rejectDeletingEmbeddedEssence(essenceToDelete);

        if (!essenceToDelete) {
            const message = this.localizationService.format(
                `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.doesNotExist`,
                { essenceId: id }
            );
            this.notificationService.warn(message);
            return undefined;
        }
        await this.essenceStore.deleteById(id);
        return essenceToDelete;
    }

    async deleteByItemUuid(itemUuid: string): Promise<Essence[]> {
        const essences = await this.essenceStore.getCollection(itemUuid, Properties.settings.collectionNames.item);
        if (essences.length === 0) {
            return [];
        }
        essences.forEach(essence => this.rejectDeletingEmbeddedEssence(essence));
        await this.essenceStore.deleteCollection(itemUuid, Properties.settings.collectionNames.item);
        return essences;
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Essence[]> {
        const essences = await this.essenceStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        if (essences.length === 0) {
            return [];
        }
        essences.forEach(essence => this.rejectDeletingEmbeddedEssence(essence));
        await this.essenceStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        return essences;
    }

    async getAll(): Promise<Map<string, Essence>> {
        const essences = await this.essenceStore.getAllEntities();
        return new Map(essences.map(essence => [essence.id, essence]));
    }

    async getAllById(essenceIds: string[]): Promise<Map<string, Essence>> {
        const essences = await this.essenceStore.getAllById(essenceIds);
        const result = new Map(essences.map(essence => [essence.id, essence]));
        const missingValues = essenceIds.filter(id => !result.has(id));
        if (missingValues.length > 0) {
            const message = this.localizationService.format(
                `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.missingEssences`,
                { essenceIds: missingValues.join(", ") }
            );
            this.notificationService.error(message);
            missingValues.forEach(id => result.set(id, undefined));
        }
        return result;
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>> {
        const essences = await this.essenceStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        return new Map(essences.map(essences => [essences.id, essences]));
    }

    async save(essence: Essence): Promise<Essence> {
        const existing = await this.essenceStore.getById(essence.id);

        this.rejectModifyingEmbeddedEssence(existing);
        await this.rejectSavingInvalidEssence(essence);

        await this.essenceStore.insert(essence);

        const localizationActivity = existing ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultEssenceAPI._LOCALIZATION_PATH}.messages.essence.${localizationActivity}`,
            { essenceName: essence.name }
        );
        this.notificationService.info(message);

        return essence;
    }

    private async rejectSavingInvalidEssence(essence: Essence): Promise<EntityValidationResult<Essence>> {
        const validationResult = await this.essenceValidator.validate(essence);
        if (validationResult.successful) {
            return validationResult;
        }
        const message = this.localizationService.format(
            `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.invalid`,
            { errors: validationResult.errors.join(", ") }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectModifyingEmbeddedEssence(essence: Essence): void {
        if (!essence?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.cannotModifyEmbedded`,
            { essenceName: essence.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectDeletingEmbeddedEssence(essenceToDelete: Essence): void {
        if (!essenceToDelete?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultEssenceAPI._LOCALIZATION_PATH}.errors.essence.cannotDeleteEmbedded`,
            { essenceName: essenceToDelete.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }
}

export { DefaultEssenceAPI };
