import { Component } from "src/scripts/crafting/component/Component";
import {ComponentApi} from "../../../src/scripts/api/ComponentApi";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";

class StubComponentApi implements ComponentApi {

    private readonly identityFactory: IdentityFactory;
    private readonly valuesById: Map<string, Component>;

    constructor({
        identityFactory = new StubIdentityFactory(),
        valuesById = new Map()
    }: {
        identityFactory?: IdentityFactory;
        valuesById?: Map<string, Component>
    } = {}) {
        this.identityFactory = identityFactory;
        this.valuesById = valuesById;
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        return new Map(Array.from(this.valuesById.values())
            .filter(component => component.craftingSystemId === craftingSystemId)
            .map(component => [component.id, component]));
    }

    async getById(id: string): Promise<Component | undefined> {
        return this.valuesById.get(id);
    }

}

export { StubComponentApi }