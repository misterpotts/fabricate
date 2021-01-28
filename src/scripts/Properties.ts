import {FabricateItemType} from "./core/FabricateFlags";

const Properties = {
    module: {
        name: 'fabricate',
        label: 'Fabricate'
    },
    types: {
        recipe: FabricateItemType.RECIPE,
        component: FabricateItemType.COMPONENT
    }
};

export default Properties;