import {EntityFactory} from "../../src/scripts/api/EntityFactory";
import {Identifiable} from "../../src/scripts/common/Identifiable";
import {Serializable} from "../../src/scripts/common/Serializable";

class StubEntityFactory<J extends { id: string }, T extends Identifiable & Serializable<J>> implements EntityFactory<J, T> {

    private readonly valuesById: Map<string, T>;
    private readonly factoryFunction: (entityJson: J) => Promise<T>;

    constructor({
        valuesById = new Map(),
        factoryFunction = () => Promise.resolve(undefined)
    }: {
        valuesById?: Map<string, T>;
        factoryFunction?: (entityJson: J) => Promise<T>;
    } = {}) {
        this.valuesById = valuesById;
        this.factoryFunction = factoryFunction;
    }

    async make(entityJson: J): Promise<T> {
        if (this.valuesById.has(entityJson.id)) {
            return this.valuesById.get(entityJson.id);
        }
        return this.factoryFunction(entityJson);
    }

}

export { StubEntityFactory }