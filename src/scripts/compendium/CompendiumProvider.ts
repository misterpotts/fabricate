import {Document} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import {AnyDocumentData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/data.mjs";
import {GameProvider} from "../foundry/GameProvider";

interface CompendiumProvider {

    getCompendium(packKey: string): CompendiumCollection<CompendiumCollection.Metadata>;

    getDocument(packKey: string, entityId: string): Promise<Document<AnyDocumentData>>

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

    public async getDocument(packKey: string, entityId: string): Promise<Document<AnyDocumentData>> {
        const compendium: CompendiumCollection<CompendiumCollection.Metadata> = this.getCompendium(packKey);
        const document: Document<AnyDocumentData> = await compendium.getDocument(entityId);
        if (!document) {
            throw new Error(`No Compendium Entry with ID '${entityId}' was found in the Compendium '${packKey}'. `);
        }
        return document;
    }

}

export { CompendiumProvider, DefaultCompendiumProvider }