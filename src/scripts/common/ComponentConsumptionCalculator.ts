import {Combination} from "./Combination";
import {CraftingComponent} from "./CraftingComponent";

enum WastageType {
    PUNITIVE,
    NON_PUNITIVE
}

class ComponentConsumptionCalculatorFactory {

    make(wastageType: WastageType): ComponentConsumptionCalculator {
        switch (wastageType) {
            case WastageType.NON_PUNITIVE:
                return new NonPunitiveComponentConsumptionCalculator();
            case WastageType.PUNITIVE:
                return new PunitiveComponentConsumptionCalculator();
        }
    }

}

interface ComponentConsumptionCalculator {

    calculate(components: Combination<CraftingComponent>): Combination<CraftingComponent>;

}

class PunitiveComponentConsumptionCalculator implements ComponentConsumptionCalculator {

    calculate(components: Combination<CraftingComponent>): Combination<CraftingComponent> {
        return components;
    }

}

class NonPunitiveComponentConsumptionCalculator implements ComponentConsumptionCalculator {

    calculate(_components: Combination<CraftingComponent>): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {
    WastageType,
    ComponentConsumptionCalculator,
    PunitiveComponentConsumptionCalculator,
    NonPunitiveComponentConsumptionCalculator,
    ComponentConsumptionCalculatorFactory
}