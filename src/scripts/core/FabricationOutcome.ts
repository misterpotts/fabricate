import { OutcomeType } from './OutcomeType';
import { FabricationAction } from './FabricationAction';
import { CraftingCheckResult } from '../crafting/CraftingCheckResult';

class FabricationOutcome {
  private readonly _outcome: OutcomeType;
  private readonly _actions: FabricationAction<any>[];
  private readonly _message: string;
  private readonly _checkResult: CraftingCheckResult;
  private readonly _removedComponents: [];

  constructor(builder: FabricationOutcome.Builder) {
    this._outcome = builder.outcome;
    this._actions = builder.actions;
    this._message = builder.message;
    this._checkResult = builder.checkResult;
    this._removedComponents = builder.removedComponents;
  }

  public static builder(): FabricationOutcome.Builder {
    return new FabricationOutcome.Builder();
  }

  get outcome(): OutcomeType {
    return this._outcome;
  }

  get actions(): FabricationAction<any>[] {
    return this._actions;
  }

  get message(): string {
    return this._message;
  }

  get checkResult(): CraftingCheckResult {
    return this._checkResult;
  }

  get removedComponents(): any[] {
    return this._removedComponents;
  }

  public checkPerformed() {
    return !!this._checkResult;
  }
}

namespace FabricationOutcome {
  export class Builder {
    public outcome: OutcomeType;
    public actions: FabricationAction<any>[];
    public message: string;
    public checkResult: CraftingCheckResult;
    public removedComponents: [];

    public build(): FabricationOutcome {
      return new FabricationOutcome(this);
    }

    public withOutcome(value: OutcomeType): Builder {
      this.outcome = value;
      return this;
    }

    public withActions(value: FabricationAction<any>[]): Builder {
      this.actions = value;
      return this;
    }

    public withMessage(value: string): Builder {
      this.message = value;
      return this;
    }

    public withCheckResult(value: CraftingCheckResult): Builder {
      this.checkResult = value;
      return this;
    }
  }
}

export { FabricationOutcome };
