import {
    DocumentInstanceForCompendiumMetadata
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/data/collections/compendium";

type Document = StoredDocument<DocumentInstanceForCompendiumMetadata<CompendiumCollection.Metadata>>;

interface CompendiumProvider {

    getCompendium(packKey: string): CompendiumCollection<CompendiumCollection.Metadata>;

    getDocument(packKey: string, entityId: string): Promise<Document>

}

class DefaultCompendiumProvider implements CompendiumProvider {

    public getCompendium(packKey: string): CompendiumCollection<CompendiumCollection.Metadata> {
        const gameInstance: Game = new GameProvider().globalGameObject();
        const compendium: CompendiumCollection<CompendiumCollection.Metadata> = gameInstance.packs.get(packKey);
        if (!compendium) {
            throw new Error(`No Compendium was found with the Compendium Pack Key '${packKey}'. `);
        }
        return compendium;
    }

    public async getDocument(packKey: string, entityId: string): Promise<Document> {
        const compendium: CompendiumCollection<CompendiumCollection.Metadata> = this.getCompendium(packKey);
        const document: Document = await compendium.getDocument(entityId);
        if (!document) {
            throw new Error(`No Compendium Entry with ID '${entityId}' was found in the Compendium '${packKey}'. `);
        }
        return document;
    }

}

export { CompendiumProvider, DefaultCompendiumProvider }