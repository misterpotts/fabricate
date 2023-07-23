import {Identifiable} from "../common/Identifiable";
import {Serializable} from "../common/Serializable";

interface EntityFactory<J, T extends Identifiable & Serializable<J>> {

    make(entityJson: J): Promise<T>;

}

export { EntityFactory }