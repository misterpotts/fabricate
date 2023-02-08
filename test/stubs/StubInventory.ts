import {Inventory} from "../../src/scripts/actor/Inventory";
import {Combination} from "../../src/scripts/common/Combination";
import {CraftingComponent} from "../../src/scripts/common/CraftingComponent";
import {AlchemyResult} from "../../src/scripts/crafting/alchemy/AlchemyResult";
import {CraftingResult} from "../../src/scripts/crafting/result/CraftingResult";

class StubInventory implements Inventory {

    actor: any;
    ownedComponents: Combination<CraftingComponent>;

    constructor({
        actor,
        ownedComponents = Combination.EMPTY()
    }: {
        actor: any,
        ownedComponents?: Combination<CraftingComponent>
    }) {
        this.actor = actor;
        this.ownedComponents = ownedComponents;
    }

    async acceptAlchemyResult(_alchemyResult: AlchemyResult): Promise<any[]> {
        return [];
    }

    async acceptCraftingResult(_craftingResult: CraftingResult): Promise<any[]> {
        return [];
    }

    contains(partId: string): boolean {
        return this.ownedComponents.hasPart(partId);
    }

    index(): Combination<CraftingComponent> {
        return undefined;
    }

}

export { StubInventory }