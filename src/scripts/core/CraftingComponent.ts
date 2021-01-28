import {FabricateFlags, FabricateItemType} from "./FabricateFlags";

class CompendiumEntry {
    private readonly _compendiumKey;
    private readonly _itemId;

    constructor(compendiumKey: string, itemId: string) {
        this._compendiumKey = compendiumKey;
        this._itemId = itemId;
    }

    get compendiumKey() {
        return this._compendiumKey;
    }

    get itemId() {
        return this._itemId;
    }
}

class CraftingComponent {
    private readonly _name: string;
    private readonly _compendiumEntry: CompendiumEntry;

    constructor(builder: CraftingComponent.Builder) {
        this._name = builder.name;
        this._compendiumEntry = builder.compendiumEntry;
    }

    get name(): string {
        return this._name;
    }

    get compendiumEntry(): CompendiumEntry {
        return this._compendiumEntry;
    }

    public static builder() {
        return new CraftingComponent.Builder();
    }

    public static fromFlags(fabricateFlags: FabricateFlags): CraftingComponent {
        if (fabricateFlags.type !== FabricateItemType.COMPONENT) {
            throw new Error(`Error attempting to instantiate a Fabricate Crafting Component from ${fabricateFlags.type} data. `);
        }
        return new CraftingComponent(fabricateFlags.component);
    }
}

namespace CraftingComponent {
    export class Builder {
        public name!: string;
        public compendiumEntry!: CompendiumEntry;

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        withCompendiumEntry(key: string, id: string): Builder {
            this.compendiumEntry = new CompendiumEntry(key, id);
            return this;
        }

        public build(): CraftingComponent {
            return new CraftingComponent(this);
        }
    }
}

export {CraftingComponent}