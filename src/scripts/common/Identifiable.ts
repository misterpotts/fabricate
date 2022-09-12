/**
 * The Type of Fabricate Item described by this entry: Recipe or Component
 * */
enum FabricateItemType {
    /**
     * This entry describes a Recipe
     * */
    RECIPE = 'RECIPE',
    /**
     * This entry describes a Crafting Component
     * */
    COMPONENT = 'COMPONENT'
}

interface Identifiable {
    id: string;
}


export {Identifiable, FabricateItemType }