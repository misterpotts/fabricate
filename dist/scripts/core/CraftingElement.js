class CompendiumEntry {
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
    constructor(builder) {
        this._name = builder.name;
        this._compendiumEntry = builder.compendiumEntry;
    }
    get name() {
        return this._name;
    }
    get compendiumEntry() {
        return this._compendiumEntry;
    }
    static builder() {
        return new CraftingElement.Builder();
    }
}
(function (CraftingElement) {
    class Builder {
        withName(value) {
            this.name = value;
            return this;
        }
        withCompendiumEntry(key, id) {
            this.compendiumEntry = new CompendiumEntry(key, id);
            return this;
        }
        build() {
            return new CraftingElement(this);
        }
    }
    CraftingElement.Builder = Builder;
})(CraftingElement || (CraftingElement = {}));
export { CraftingElement };
