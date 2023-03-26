import {Combination} from "./Combination";
import {Component} from "../crafting/component/Component";

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

    calculate(components: Combination<Component>): Combination<Component>;

}

class PunitiveComponentConsumptionCalculator implements ComponentConsumptionCalculator {

    calculate(components: Combination<Component>): Combination<Component> {
        return components;
    }

}

class NonPunitiveComponentConsumptionCalculator implements ComponentConsumptionCalculator {

    calculate(_components: Combination<Component>): Combination<Component> {
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