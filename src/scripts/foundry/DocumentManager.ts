interface FabricateItemData {
    uuid: string;
    name: string;
    imageUrl: string;
    source: any;
}

interface DocumentManager {

    getDocumentByUuid(id: string): Promise<FabricateItemData>;

    getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>>;

}

class ItemNotFoundError extends Error {

    private static readonly formatErrorMessage = (id: string) => `Item with id ${id} was not found. `;
    private readonly _itemUuid: string;

    constructor(itemUuid: string) {
        super(ItemNotFoundError.formatErrorMessage(itemUuid));
        this._itemUuid = itemUuid;
    }

    get itemUuid(): string {
        return this._itemUuid;
    }

}

class DefaultDocumentManager implements DocumentManager {

    public async getDocumentByUuid(id: string): Promise<FabricateItemData> {
        const document = await fromUuid(id);
        if (document) {
            return this.formatItemData(document);
        }
        throw new ItemNotFoundError(id);
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(ids.map(id => this.getDocumentByUuid(id).catch(e => e)));
        const firstErrorResult = itemData.find(result => result instanceof Error);
        if (firstErrorResult) {
            throw firstErrorResult;
        }
        return new Map(itemData.map(item => [item.uuid,item]));
    }

    private formatItemData(document: any): FabricateItemData {
        return <FabricateItemData> {
            uuid: document.uuid,
            name: document.name,
            imageUrl: document.img,
            source: document
        }
    }

}

export { FabricateItemData, DocumentManager, DefaultDocumentManager, ItemNotFoundError }