class CompendiumEntry {
    private readonly _compendiumKey;
    private readonly _itemId;

    constructor(compendiumKey, itemId) {
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

class CraftingElement {
    private readonly _name: string;
    private readonly _compendiumEntry: CompendiumEntry;

    constructor(builder: CraftingElement.Builder) {
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
        return new CraftingElement.Builder();
    }
}

namespace CraftingElement {
    export class Builder {
        public name: string;
        public compendiumEntry: CompendiumEntry;

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

        withCompendiumEntry(key: string, id: string): Builder {
            this.compendiumEntry = new CompendiumEntry(key, id);
            return this;
        }

        public build(): CraftingElement {
            return new CraftingElement(this);
        }
    }
}

export {CraftingElement}