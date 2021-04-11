/**
 * The type of action to take for a Recipe Result: Add or Remove the component
 * */
enum RecipeResultActionType {
    /**
     * This action requires the specified quantity of Component(s) to be added
     * */
    ADD = 'ADD',
    /**
     * This action requires the specified quantity of Component(s) to be removed
     * */
    REMOVE = 'REMOVE'
}

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

export {RecipeResultActionType, FabricateItemType}