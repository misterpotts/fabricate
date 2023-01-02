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

class DefaultDocumentManager implements DocumentManager {

    public async getDocumentByUuid(id: string): Promise<FabricateItemData> {
        const document = await fromUuid(id);
        return this.formatItemData(document);
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(ids.map(id => this.getDocumentByUuid(id)));
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

export { FabricateItemData, DocumentManager, DefaultDocumentManager }