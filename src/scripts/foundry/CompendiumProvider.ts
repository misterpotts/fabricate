import {
  ItemDataSchema,
  ItemDataSource,
} from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

class CompendiumProvider {
  public getCompendium(packKey: string): CompendiumCollection<CompendiumCollection.Metadata> {
    const compendium = <CompendiumCollection<CompendiumCollection.Metadata>>game.packs?.get(packKey);
    if (!compendium) {
      throw new Error(`No Compendium was found with the Compendium Pack Key '${packKey}'. `);
    }
    return compendium;
  }

  public async getDocument<D>(packKey: string, entityId: string): Promise<Item> {
    const compendium = <CompendiumCollection<CompendiumCollection.Metadata>>this.getCompendium(packKey);
    // @ts-ignore todo: Pretty sure this typing is correct. Check with smart folks in League to find out why it errors
    //const entity: Document<ItemData> = await compendium.getEntity(entityId);
    const entity: Item = await compendium.getDocument(entityId);
    if (!entity) {
      throw new Error(`No Compendium Entry with ID '${entityId}' was found in the Compendium '${packKey}'. `);
    }
    return entity;
  }
}

export { CompendiumProvider };
