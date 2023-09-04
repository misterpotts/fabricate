import {Identifiable} from "../../common/Identifiable";
import {Serializable} from "../../common/Serializable";

interface EssenceReferenceJson {
    id: string;
}

export { EssenceReferenceJson }

class EssenceReference implements Identifiable, Serializable<EssenceReferenceJson> {

    private readonly _id: string;

    constructor(id: string) {
        this._id = id
    }

    get id(): string {
        return this._id;
    }

    toJson(): EssenceReferenceJson {
        return {
            id: this._id
        };
    }

    static fromEssenceId(essenceId: string): EssenceReference {
        return new EssenceReference(essenceId);
    }

}

export { EssenceReference }