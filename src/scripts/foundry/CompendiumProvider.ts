class CompendiumProvider {
  public getCompendium(packKey: string): Compendium {
    const compendium: Compendium = game.packs.get(packKey);
    if (!compendium) {
      throw new Error(`No Compendium was found with the Compendium Pack Key '${packKey}'. `);
    }
    return compendium;
  }

  public async getDocument<D>(packKey: string, entityId: string): Promise<Document<ItemData>> {
    const compendium: Compendium = this.getCompendium(packKey);
    // @ts-ignore todo: Pretty sure this typing is correct. Check with smart folks in League to find out why it errors
    const entity: Document<ItemData> = await compendium.getEntity(entityId);
    if (!entity) {
      throw new Error(`No Compendium Entry with ID '${entityId}' was found in the Compendium '${packKey}'. `);
    }
    return entity;
  }
}

export { CompendiumProvider };
