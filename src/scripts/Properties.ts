import {FabricateItemType} from "./core/FabricateFlags";

const Properties = {
    module: {
        name: 'fabricate',
        label: 'Fabricate',
        templates: {
            recipeTab: 'modules/fabricate/templates/recipe-tab.html'
        }
    },
    types: {
        recipe: FabricateItemType.RECIPE,
        component: FabricateItemType.COMPONENT
    }
};

export default Properties;