import {CompendiumProvider} from "../../src/scripts/compendium/CompendiumProvider";
import {AnyDocumentData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/data.mjs";
import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";

class StubDocument {

    private readonly _id: string;
    private readonly _rawData: any;

    constructor(id: string, rawData: any) {
        this._id = id;
        this._rawData = rawData;
    }

    get id(): string {
        return this._id;
    }

    get data(): any {
        return this._rawData;
    }

    get flags(): any {
        return this._rawData.flags;
    }

    get name(): string {
        return this._rawData.name;
    }

    get img(): string {
        return this._rawData.img;
    }

}

class StubCompendiumCollection {

    private readonly _packKey: string;
    private readonly _type: string;
    private readonly _documentsById: Map<string, Document<AnyDocumentData>>;

    constructor(packKey: string, type: string, documentsById: Map<string, Document<AnyDocumentData>>) {
        this._packKey = packKey;
        this._type = type;
        this._documentsById = documentsById;
    }

    get(documentId: string): Document<AnyDocumentData> {
        return this._documentsById.get(documentId);
    }

    get metadata(): { type: string } {
        return { type: this._type };
    }

    get collection() {
        return this._packKey;
    }

    getDocuments(): Document<AnyDocumentData>[] {
        return Array.from(this._documentsById.values());
    }
}

class JsonCompendiumProvider implements CompendiumProvider {

    private readonly _rawCompendiumData: Map<string, any[]>;
    private readonly _parsedCompendiumData: Map<string, CompendiumCollection<CompendiumCollection.Metadata>>;

    constructor(compendiumData?: Map<string, {}[]>) {
        this._rawCompendiumData = compendiumData ? compendiumData : new Map<string, {}[]>();
        this._parsedCompendiumData = new Map<string, CompendiumCollection<CompendiumCollection.Metadata>>();
    }

    getCompendium(packKey: string): CompendiumCollection<CompendiumCollection.Metadata> {
        if (this._parsedCompendiumData.has(packKey)) {
            return this._parsedCompendiumData.get(packKey);
        }
        if (!this._rawCompendiumData.has(packKey)) {
            throw new Error(`No data provided for Compendium: ${packKey}. `);
        }
        const compendium: CompendiumCollection<CompendiumCollection.Metadata> = this.parse(packKey, this._rawCompendiumData.get(packKey));
        this._parsedCompendiumData.set(packKey, compendium);
        return compendium;
    }

    async getDocument(packKey: string, entityId: string): Promise<Document<AnyDocumentData>> {
        return this.getCompendium(packKey).get(entityId);
    }

    private parse(packKey: string, rawCompendiumData: any[]): CompendiumCollection<CompendiumCollection.Metadata> {
        const compendiumEntries: [string, Document<AnyDocumentData>][] = rawCompendiumData.map(jsonData => new StubDocument(jsonData._id, jsonData))
            .map(stubDocument => [stubDocument.id, stubDocument as unknown as Document<AnyDocumentData>]);
        const documentsById: Map<string, Document<AnyDocumentData>> = new Map(compendiumEntries);
        return new StubCompendiumCollection(packKey, "Item", documentsById) as unknown as CompendiumCollection<CompendiumCollection.Metadata>;
    }
}

export { JsonCompendiumProvider }