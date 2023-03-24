import {Inventory} from "../../src/scripts/actor/Inventory";
import {Combination} from "../../src/scripts/common/Combination";
import {Component} from "../../src/scripts/common/Component";
import {AlchemyResult} from "../../src/scripts/crafting/alchemy/AlchemyResult";
import {CraftingResult} from "../../src/scripts/crafting/result/CraftingResult";
import {SalvageResult} from "../../src/scripts/crafting/result/SalvageResult";

class StubInventory implements Inventory {

    actor: any;
    ownedComponents: Combination<Component>;

    constructor({
        actor,
        ownedComponents = Combination.EMPTY()
    }: {
        actor: any,
        ownedComponents?: Combination<Component>
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

    contains(craftingComponent: Component, quantity: number = 1): boolean {
        return this.ownedComponents.amountFor(craftingComponent.id) >= quantity;
    }

    index(): Promise<void> {
        return undefined;
    }

    size: number;

    acceptSalvageResult(_salvageResult: SalvageResult): Promise<any[]> {
        return Promise.resolve([]);
    }

    amountFor(craftingComponent: Component): number {
        return this.ownedComponents.amountFor(craftingComponent);
    }

}

export { StubInventory }