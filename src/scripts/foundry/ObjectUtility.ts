import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';

class ObjectUtility {
  public duplicate<T = {}>(source: T): T {
    // @ts-ignore
    return duplicate(source);
  }

  public merge<T extends ItemData>(target: T, source: T): T {
    return mergeObject(<ItemData>target, source);
  }
}

export { ObjectUtility };
