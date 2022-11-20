import {DocumentManager} from "../../src/scripts/foundry/DocumentManager";

interface RawItemData {
    img: string;
    name: string;
    uuid: string;
}

class StubDocumentManager implements DocumentManager {

    private readonly _itemsByUUid: Map<string, RawItemData>;

    constructor(itemsByUUid?: Map<string, RawItemData>) {
        this._itemsByUUid = itemsByUUid ?? new Map<string, RawItemData>();
    }

    getDocumentByUuid(id: string): Promise<any> {
        return Promise.resolve(this._itemsByUUid.get(id));
    }
    getDocumentsByUuid(ids: string[]): Promise<any[]> {
        return Promise.resolve(ids.map(id => this._itemsByUUid.get(id)));
    }

    public addItem(uuid: string, data: RawItemData): void {
        this._itemsByUUid.set(uuid, data);
    }

}

export { StubDocumentManager, RawItemData }