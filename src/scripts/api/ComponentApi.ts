import {Component, ComponentJson} from "../common/Component";

interface ComponentApi {
    create(craftingSystemId: string, componentJson: ComponentJson): Promise<Component>;
}

export { ComponentApi };
class DefaultComponentApi implements ComponentApi {

    create(craftingSystemId: string, componentJson: ComponentJson): Promise<Component> {
        return Promise.resolve(undefined);
    }

}

export { DefaultComponentApi };
