import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";

interface ComponentReferenceJson {
    id: string;
}

export { ComponentReferenceJson }

class ComponentReference implements Identifiable, Serializable<ComponentReferenceJson> {

    private readonly _id: string;

    constructor(id: string) {
        this._id = id
    }

    get id(): string {
        return this._id;
    }

    toJson(): ComponentReferenceJson {
        return {
            id: this._id
        };
    }

    static fromComponentId(componentId: string): ComponentReference {
        return new ComponentReference(componentId);
    }

}

export { ComponentReference }