import Properties from "../Properties";

enum FabricateItemDataErrorCodeType {
    ITEM_NOT_FOUND = "itemNotFound",
    ITEM_NOT_SET = "itemNotSet",
}

interface ItemLoadingError {
    message: string;
    code: string;
}

class ItemNotFoundError extends Error implements ItemLoadingError {

    private static readonly formatErrorMessage = (id: string) => `Item with id ${id} was not found. `;
    private static readonly _code: string = FabricateItemDataErrorCodeType.ITEM_NOT_FOUND;

    private readonly _itemUuid: string;

    constructor(itemUuid: string) {
        super(ItemNotFoundError.formatErrorMessage(itemUuid));
        this._itemUuid = itemUuid;
    }

    get itemUuid(): string {
        return this._itemUuid;
    }

    get message(): string {
        return super.message;
    }

    get code(): string {
        return ItemNotFoundError._code;
    }

}

class ItemNotConfiguredError extends Error implements ItemLoadingError {

    private static readonly formatErrorMessage = () => `This component has no Item associated with it. `;
    private static readonly _code: string = FabricateItemDataErrorCodeType.ITEM_NOT_SET;

    constructor() {
        super(ItemNotConfiguredError.formatErrorMessage());
    }

    get message(): string {
        return super.message;
    }

    get code(): string {
        return ItemNotConfiguredError._code;
    }

}

interface FabricateItemDataJson {
    uuid?: string;
}

/**
 * Fabricate Item Data abstracts away the document loading process, detects and describes loading errors, as well as
 * providing a reduced document data model that Fabricate uses to render parts in the Foundry UI.
 *
 * @interface
 */
interface FabricateItemData {

    /**
     * The UUID of the item.
     *
     * @type {string}
     */
    uuid: string;

    /**
     * The name of the item. Accessing this property before the item has been loaded will produce an error.
     *
     * @type {string}
     */
    name: string;

    /**
     * The item's image URL. Accessing this property before the item has been loaded will produce an error.
     *
     * @type {string}
     */
    imageUrl: string;

    /**
     * The source document for the item. Accessing this property before the item has been loaded will produce an error.
     *
     * @type {any}
     */
    sourceDocument: any;

    /**
     * An array of item loading errors. Will be empty if no errors occurred when loading the item, or if it has not been
     * loaded yet.
     *
     * @type {ItemLoadingError[]}
     */
    errors: ItemLoadingError[];

    /**
     * A convenience function that indicates whether the item has loading errors or not. Checks the length of `errors`
     * is zero.
     *
     * @type {boolean}
     */
    hasErrors: boolean;

    /**
     * Indicates whether the item is loaded or not.
     *
     * @type {boolean}
     */
    isLoaded: boolean;

    /**
     * Converts the item data to its JSON representation.
     *
     * @returns {FabricateItemDataJson} - The JSON representation of the item data.
     */
    toJson(): FabricateItemDataJson;

    /**
     * Loads the item data asynchronously. If no Item UUID has been set this method will produce an error.
     *
     * @async
     * @returns {Promise<void>} - A promise that resolves when the item data has been loaded.
     */
    load(): Promise<FabricateItemData>;

}

class NoFabricateItemData implements FabricateItemData {

    private static readonly _INSTANCE = new NoFabricateItemData();
    private static readonly _UUID = "NO_ITEM_UUID";
    private static readonly _NAME = "No Item Configured";
    private static readonly _ERRORS = [ new ItemNotConfiguredError() ];
    private static readonly _IMAGE_URL = Properties.ui.defaults.noItemImageUrl;

    public static INSTANCE(): NoFabricateItemData {
        return NoFabricateItemData._INSTANCE;
    }

    public static UUID() {
        return NoFabricateItemData._UUID;
    }

    get isLoaded(): boolean {
        return false;
    }

    get errors(): ItemLoadingError[] {
        return NoFabricateItemData._ERRORS;
    }

    get hasErrors(): boolean {
        return true;
    }

    get imageUrl(): string {
        return NoFabricateItemData._IMAGE_URL;
    }

    get name(): string {
        return NoFabricateItemData._NAME;
    }

    get sourceDocument(): any {
        return null;
    }

    get uuid(): string {
        return NoFabricateItemData.UUID();
    }

    toJson(): FabricateItemDataJson {
        return { uuid: null };
    }

    load(): Promise<FabricateItemData> {
        throw new Error("An attempt was made to load item data for a part with no item UUID set. ");
    }

}

class PendingFabricateItemData implements FabricateItemData {

    private readonly _itemUuid: string;
    private readonly _cachedLoadingFunction: CachedLoadingFunction;

    constructor(itemUuid: string, cachedLoadingFunction: CachedLoadingFunction) {
        this._itemUuid = itemUuid;
        this._cachedLoadingFunction = cachedLoadingFunction;
    }

    get errors(): ItemLoadingError[] {
        return [];
    }

    get hasErrors(): boolean {
        return false;
    }

    get imageUrl(): string {
        throw new Error("Cannot get the item image URL before the item has been loaded. " +
            "Call the part's `load()` method before accessing this field. ");
    }

    get isLoaded(): boolean {
        return false;
    }

    get name(): string {
        throw new Error("Cannot get the item name before the item has been loaded. " +
            "Call the part's `load()` method before accessing this field. ");
    }

    get sourceDocument(): any {
        throw new Error("Cannot get the item source document before the item has been loaded. " +
            "Call the part's `load()` method before accessing this field. ");
    }

    get uuid(): string {
        return this._itemUuid;
    }

    toJson(): FabricateItemDataJson {
        return { uuid: this._itemUuid };
    }

    load(): Promise<FabricateItemData> {
        return this._cachedLoadingFunction(this._itemUuid);
    }

}

class LoadedFabricateItemData implements FabricateItemData {

    private readonly _errors: ItemLoadingError[];
    private readonly _itemUuid: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _sourceDocument: any;

    constructor({
        name,
        itemUuid,
        imageUrl,
        errors = [],
        sourceDocument
    }: {
        itemUuid: string;
        name: string;
        imageUrl: string;
        sourceDocument: any;
        errors?: ItemLoadingError[];
    }) {
        this._errors = errors;
        this._itemUuid = itemUuid;
        this._name = name;
        this._imageUrl = imageUrl;
        this._sourceDocument = sourceDocument;
    }

    get isLoaded(): boolean {
        return !this.hasErrors && !!this.sourceDocument;
    }

    get errors(): ItemLoadingError[] {
        return this._errors;
    }

    get hasErrors(): boolean {
        return this.errors.length > 0;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get name(): string {
        return this._name;
    }

    get sourceDocument(): any {
        return this._sourceDocument;
    }

    get uuid(): string {
        return this._itemUuid;
    }

    toJson(): FabricateItemDataJson {
        return { uuid: this._itemUuid };
    }

    async load(): Promise<FabricateItemData> {
        return this;
    }

}

class BrokenFabricateItemData implements FabricateItemData {
    private readonly _errors: ItemLoadingError[];
    private readonly _itemUuid: string;
    private readonly _imageUrl: string = Properties.ui.defaults.erroredItemImageUrl;

    constructor({
        itemUuid,
        errors = []
    }: {
        itemUuid: string;
        errors: ItemLoadingError[];
    }) {
        this._errors = errors;
        this._itemUuid = itemUuid;
    }

    get isLoaded(): boolean {
        return false;
    }

    get errors(): ItemLoadingError[] {
        return this._errors;
    }

    get hasErrors(): boolean {
        return true;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get name(): string {
        return `UUID: ${this._itemUuid}. `;
    }

    get sourceDocument(): any {
        return null;
    }

    get uuid(): string {
        return this._itemUuid;
    }

    toJson(): FabricateItemDataJson {
        return { uuid: this._itemUuid };
    }

    load(): Promise<FabricateItemData> {
        throw new Error("Cannot load item data for this part. There are problems with the item document.");
    }

}

type CachedLoadingFunction = (uuid: string) => Promise<FabricateItemData>;

interface DocumentManager {

    loadItemDataByDocumentUuid(id: string): Promise<FabricateItemData>;

    loadItemDataForDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>>;

    prepareItemDataByDocumentUuid(uuid: string): Promise<FabricateItemData>;

}

class DefaultDocumentManager implements DocumentManager {

    public async loadItemDataByDocumentUuid(uuid: string): Promise<FabricateItemData> {
        if (!uuid || uuid === NoFabricateItemData.UUID()) {
            return new NoFabricateItemData();
        }
        const document = await fromUuid(uuid);
        if (document) {
            return this.formatItemData(document);
        } else {
            return new BrokenFabricateItemData({
                itemUuid: uuid,
                errors: [new ItemNotFoundError(uuid)]
            });
        }
    }

    async prepareItemDataByDocumentUuid(uuid: string): Promise<FabricateItemData> {
        if (!uuid || uuid === NoFabricateItemData.UUID()) {
            return new NoFabricateItemData();
        }
        return new PendingFabricateItemData(uuid, (id: string) => this.loadItemDataByDocumentUuid(id));
    }

    public async loadItemDataForDocumentsByUuid(uuids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(uuids.map(id => this.loadItemDataByDocumentUuid(id).catch(e => e)));
        return new Map(itemData.map(item => [item.uuid, item]));
    }

    private formatItemData(document: any, errors: ItemLoadingError[] = []): FabricateItemData {
        return new LoadedFabricateItemData({
            itemUuid: document.uuid,
            name: document.name,
            imageUrl: document.img,
            sourceDocument: document,
            errors: errors,
        });
    }

}

export {
    FabricateItemData,
    DocumentManager,
    DefaultDocumentManager,
    ItemNotFoundError,
    ItemLoadingError,
    NoFabricateItemData,
    LoadedFabricateItemData,
    PendingFabricateItemData,
    ItemNotConfiguredError,
    BrokenFabricateItemData,
    FabricateItemDataJson
}