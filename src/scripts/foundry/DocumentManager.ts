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

interface FabricateItemData {
    uuid: string;
    name: string;
    imageUrl: string;
    sourceDocument: any;
    errors: ItemLoadingError[];
    hasErrors: boolean;
    loaded: boolean;
    toJson(): FabricateItemDataJson;
}

class NoFabricateItemData implements FabricateItemData {

    private static readonly _INSTANCE = new NoFabricateItemData();
    private static readonly _UUID = "NO_ITEM_UUID";
    private static readonly _NAME = "No Item Configured";
    private static readonly _ERRORS = [new ItemNotConfiguredError()];
    private static readonly _IMAGE_URL = Properties.ui.defaults.noItemImageUrl;

    public static INSTANCE(): NoFabricateItemData {
        return NoFabricateItemData._INSTANCE;
    }

    public static UUID() {
        return NoFabricateItemData._UUID;
    }

    get loaded(): boolean {
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

}

class PendingFabricateItemData implements FabricateItemData {

    private readonly _itemUuid: string;

    constructor(itemUuid?: string) {
        this._itemUuid = itemUuid;
    }

    get errors(): ItemLoadingError[] {
        return [];
    }

    get hasErrors(): boolean {
        return false;
    }

    get imageUrl(): string {
        return null;
    }

    get loaded(): boolean {
        return false;
    }

    get name(): string {
        return null;
    }

    get sourceDocument(): any {
        return null;
    }

    get uuid(): string {
        return this._itemUuid;
    }

    toJson(): FabricateItemDataJson {
        throw new Error("Pending item data should never be serialised. ");
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

    get loaded(): boolean {
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

    get loaded(): boolean {
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

}

interface DocumentManager {

    getDocumentByUuid(id: string): Promise<FabricateItemData>;

    getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>>;

}

class DefaultDocumentManager implements DocumentManager {

    public async getDocumentByUuid(id: string): Promise<FabricateItemData> {
        if (!id || id === NoFabricateItemData.UUID()) {
            return new NoFabricateItemData();
        }
        const document = await fromUuid(id);
        if (document) {
            return this.formatItemData(document);
        } else {
            return new BrokenFabricateItemData({
                itemUuid: id,
                errors: [new ItemNotFoundError(id)]
            });
        }
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(ids.map(id => this.getDocumentByUuid(id).catch(e => e)));
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