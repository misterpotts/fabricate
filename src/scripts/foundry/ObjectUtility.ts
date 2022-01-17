class ObjectUtility {
  public duplicate<T = {}>(source: T): T {
    // @ts-ignore
    return duplicate(source);
  }

  public merge<T = {}>(target: T, source: T): T {
    return mergeObject(target, source);
  }
}

export { ObjectUtility };
