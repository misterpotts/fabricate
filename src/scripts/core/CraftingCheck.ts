import {OutcomeType} from "./FabricationOutcome";
import {CraftingComponent} from "./CraftingComponent";

interface DiceTermConstructorData {
    number?: number;
    faces?: number;
    modifiers?: string[];
    options?: object;
}

class CraftingCheckResult {
    private readonly _outcome: OutcomeType;
    private readonly _expression: string;
    private readonly _result: number;
    private readonly _successThreshold: number;

    constructor(outcome: OutcomeType, expression: string, result: number, successThreshold: number) {
        this._outcome = outcome;
        this._expression = expression;
        this._result = result;
        this._successThreshold = successThreshold;
    }


    get outcome(): OutcomeType {
        return this._outcome;
    }

    get expression(): string {
        return this._expression;
    }

    get result(): number {
        return this._result;
    }

    get successThreshold(): number {
        return this._successThreshold;
    }
}

class Tool {
    private readonly _name: string;
    private readonly _proficiencyLabel: string;

    constructor(name: string, proficiencyLabel: string) {
        this._name = name;
        this._proficiencyLabel = proficiencyLabel;
    }

    get name(): string {
        return this._name;
    }

    get proficiencyLabel(): string {
        return this._proficiencyLabel;
    }
}

abstract class CraftingCheck<T extends Actor> {
    private readonly _exceedThreshold: boolean;

    protected constructor(exceedThreshold: boolean) {
        this._exceedThreshold = exceedThreshold;
    }

    public perform(actor: T, components: CraftingComponent[]): CraftingCheckResult {
        const rollTerm: DiceTerm = this.constructRollTerm(this.getRollTermData(actor));
        // @ts-ignore
        const rolled: {result: number, active: boolean} = rollTerm.roll();
        const successThreshold = this.getSuccessThreshold(components);
        const outcome: OutcomeType = this.compare(rolled.result,successThreshold, this._exceedThreshold);
        return new CraftingCheckResult(outcome, rollTerm.expression, rolled.result, successThreshold);
    }

    private compare(result: number, threshold: number, exceedThreshold: boolean): OutcomeType {
        switch (exceedThreshold) {
            case true:
                return result > threshold ? OutcomeType.SUCCESS : OutcomeType.FAILURE;
            case false:
                return result >= threshold ? OutcomeType.SUCCESS : OutcomeType.FAILURE;
        }
    }

    protected convertToExpression(...values: number[]): string[] {
        if (!values || values.length === 0) {
            return [];
        }
        return values.map((value => `${Math.sign(value) < 1 ? '-' : '+'}${value}`));
    }

    protected abstract getSuccessThreshold(components: CraftingComponent[]): number;

    protected abstract getRollTermData(actor: T): DiceTermConstructorData;

    /*
    * This function exists solely for stubbing in test, as Sinon doesn't seem to want to stub the DiceTerm constructor
    * in the gulp build, but will do it in the IDE :shrug: TODO - Look at whether or not Jest is less bad at this than
    * Mocha/Sinon
    * */
    private constructRollTerm(args: DiceTermConstructorData) {
        return new DiceTerm(args);
    }

}

class CraftingCheck5e extends CraftingCheck<Actor5e>{
    private readonly _ability: AbilityType5e;
    private readonly _baseDC: number;
    private readonly _ingredientDCModifier: number;
    private readonly _essenceDCModifier: number;
    private readonly _tool: Tool;

    constructor(builder: CraftingCheck5e.Builder) {
        super(false);
        this._ability = builder.ability;
        this._baseDC = builder.baseDC;
        this._ingredientDCModifier = builder.ingredientDCModifier;
        this._essenceDCModifier = builder.essenceDCModifier;
        this._tool = builder.tool;
    }

    public static builder():CraftingCheck5e.Builder {
        return new CraftingCheck5e.Builder();
    }

    protected getSuccessThreshold(components: CraftingComponent[]): number {
        const ingredientCountContributes: boolean = this.ingredientDCModifier && this.ingredientDCModifier > 0;
        const essenceCountContributes: boolean = this.essenceDCModifier && this.essenceDCModifier > 0;
        const dcModifier = components.map((component: CraftingComponent) => {
                const essenceContribution: number = essenceCountContributes ? component.essences.length * this.essenceDCModifier : 0;
                const ingredientContribution: number = ingredientCountContributes ? this.ingredientDCModifier : 0;
                return ingredientContribution + essenceContribution;
            })
            .reduce((left: number, right: number) => left + right, 0);
        return this.baseDC + dcModifier;
    }

    protected getRollTermData(actor: Actor5e): DiceTermConstructorData {
        const modifiers: string[] = this.getModifiers(actor, this.ability, this.tool);
        return {number: 1, faces: 20, modifiers: modifiers};
    }

    private getModifiers(actor: Actor5e, ability: AbilityType5e, tool?: Tool): string[] {
        const actorAbilityData: [string, AbilityDefinition5e] = Object.entries(actor.data.data.abilities).find((abilityRecord: [string, AbilityDefinition5e]) => abilityRecord[0] === ability);
        if (!actorAbilityData || !actorAbilityData[1]) {
            throw new Error(`No ability definition for '${ability}' was found on Actor ${actor.name}`);
        }
        const craftingAbility: AbilityDefinition5e = actorAbilityData[1];
        if (!tool) {
            return this.convertToExpression(craftingAbility.mod);
        }
        const allToolProficiencies: string[] = actor.data.data.traits.toolProf.custom.split(',')
            .map((customProficiency: string) => customProficiency.trim())
            .concat(actor.data.data.traits.toolProf.value);
        const toolProficiency: string = allToolProficiencies
            .find((toolProficiency: string) => tool.proficiencyLabel.localeCompare(toolProficiency, undefined, {sensitivity: 'base'}) === 0);
        if (!toolProficiency) {
            return this.convertToExpression(craftingAbility.mod);
        }
        const ownedTool: Item5e = actor.items
            .find((item: Item5e) => item.type === 'tool' && tool.name.localeCompare(item.name, undefined, {sensitivity: 'base'}) === 0);
        if (!ownedTool) {
            return this.convertToExpression(craftingAbility.mod);
        }
        return this.convertToExpression(craftingAbility.mod, actor.data.data.attributes.prof);
    }

    get ability(): AbilityType5e {
        return this._ability;
    }

    get baseDC(): number {
        return this._baseDC;
    }

    get ingredientDCModifier(): number {
        return this._ingredientDCModifier;
    }

    get essenceDCModifier(): number {
        return this._essenceDCModifier;
    }

    get tool(): Tool {
        return this._tool;
    }
}

namespace CraftingCheck5e {

    export class Builder {

        public ability: AbilityType5e;
        public baseDC: number;
        public ingredientDCModifier: number;
        public essenceDCModifier: number;
        public tool: Tool;

        public build(): CraftingCheck5e {
            return new CraftingCheck5e(this);
        }

        public withAbility(value: AbilityType5e): Builder {
            this.ability = value;
            return this;
        }

        public withBaseDC(value: number): Builder {
            this.baseDC = value;
            return this;
        }

        public withIngredientDCModifier(value: number): Builder {
            this.ingredientDCModifier = value;
            return this;
        }

        public withEssenceDCModifier(value: number): Builder {
            this.essenceDCModifier = value;
            return this;
        }

        public withTool(value: Tool): Builder {
            this.tool = value;
            return this;
        }

    }

}

export {CraftingCheck, CraftingCheck5e, CraftingCheckResult, Tool}