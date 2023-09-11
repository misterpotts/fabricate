---
layout: page
title: Other Types
permalink: /api/types/
parent: API
nav_order: 7
has_children: true
---

# Other types
{: .no_toc }

Fabricate provides a set of utility types and other classes for use in acting on essences, components and recipes.

<details markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Combination

A `Combination` is a powerful, set-like data structure designed to simplify complex operations on essences and components (and any other entities used in crafting). 
Each member of a combination is unique, and the order of members is not important.
Uniqueness is enforced by the `Identifiable` interface, which requires that each member has a unique identifier accessed by its `id` property.
Members are stored in [Units](#unit).

<details markdown="block">
<summary>
The Combination interface
</summary>

```typescript
/**
 * Represents a collection of units, each with an element and an associated quantity.
 * The Combination class provides various methods to create, manipulate, and compare combinations of units.
 *
 * @template T - The type of the unit elements that are stored in the Combination. Must extend Identifiable.
 */
interface Combination<T extends Identifiable> {

    /**
     * A map of member IDs to their corresponding quantities in the Combination.
     */
    readonly amounts: Map<string, Unit<T>>;

    /**
     * The sum of unit quantities in the Combination.
     */
    readonly size: number;

    /**
     * An array of the distinct members in the Combination.
     */
    readonly members: T[];

    /**
     * An array of the distinct Units in the Combination.
     */
    readonly units: Unit<T>[];

    /**
     * Constructs a new Combination instance containing only the specified member and its corresponding amount from the
     *   current Combination.
     *
     * @template T - A type extending Identifiable, representing the member type.
     * @param {T} member - The member to be included in the resulting Combination.
     * @returns {Combination<T>} A new Combination instance containing only the specified member with its current amount.
     */
    just(member: T): Combination<T>;

    /**
     * Retrieves the number of distinct Units contained in the Combination.
     *
     * @returns {number} The count of distinct Units in the Combination.
     */
    distinct(): number;

    /**
     * Creates and returns a deep copy of the current Combination instance.
     *
     * @returns {Combination<T>} A new Combination instance containing the same identifier-Unit pairs as the current one.
     */
    clone(): Combination<T>;

    /**
     * Determines whether the Combination contains the specified member with an optional minimum quantity.
     *
     * @param {T} member - The member to check for in the Combination.
     * @param quantity - The minimum quantity of the member required. The default value is 1.
     * @returns {boolean} True if the Combination contains the specified member with the required quantity, otherwise
     *   false.
     */
    has(member: T | string, quantity?: number): boolean;

    /**
     * Retrieves the quantity of the specified member in the Combination.
     *
     * @param {string | T} member - The member, or its identifier, to retrieve the quantity for.
     * @returns {number} The quantity of the specified member in the Combination, or 0 if the member is not present.
     */
    amountFor(member: string | T): number;

    /**
     * Determines whether the Combination is empty, i.e., contains no Units or has a total size of zero.
     *
     * @returns {boolean} True if the Combination is empty, otherwise false.
     */
    isEmpty(): boolean;

    /**
     * Determines whether the current Combination is a subset of the specified Combination.
     * A Combination is a subset of another if all its Units are present in the other Combination with at least the same quantities.
     *
     * @param {Combination<Identifiable>} other - The Combination to check against.
     * @returns {boolean} True if the current Combination is a subset of the specified Combination, otherwise false.
     */
    isIn(other: Combination<Identifiable>): boolean;

    /**
     * Determines whether the current Combination is a superset of the specified Combination.
     * A Combination is a superset of another if it contains all the Units of the other Combination with at least the same quantities.
     *
     * @param {Combination<Identifiable>} other - The Combination to check against.
     * @returns {boolean} True if the current Combination is a superset of the specified Combination, otherwise false.
     */
    contains(other: Combination<Identifiable>): boolean;

    /**
     * Merges two Combinations without altering them to produce a new Combination, representing the union of both Combinations.
     * The new Combination contains the sum of the quantities of each Unit present in both the original Combinations.
     *
     * @param {Combination<T>} other - The other Combination to merge with this one.
     * @returns {Combination<T>} A new Combination, resulting from the merge of this Combination and the provided other Combination.
     */
    combineWith(other: Combination<T>): Combination<T>;

    /**
     * Merges an additional Unit into this Combination without altering it to produce a new Combination,
     * representing the result of adding the new Unit. The new Combination contains the sum of the quantities of the
     * Unit and the existing Unit with the same member in the original Combination.
     *
     * @param {Unit<T>} additionalUnit - The additional Unit to merge into this Combination.
     * @returns {Combination<T>} A new Combination, resulting from the merge of the provided Unit into this Combination.
     */
    addUnit(additionalUnit: Unit<T>): Combination<T>;

    /**
     * Increments the quantity of a member in the original Combination by the specified quantity.
     * If the member id is provided, and the member is not in the original Combination, an error will be thrown.
     *
     * @param {string | T} memberToIncrement - The ID or instance of the member element to increment in the original Combination.
     * @param {number} [quantity=1] - The quantity to increment the specified member by (default is 1).
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified member.
     * @throws Will throw an error if the memberToIncrement is null, or the member ID is not found in the original Combination.
     */
    increment(memberToIncrement: string | T, quantity?: number): Combination<T>;

    /**
     * Decrements the quantity of a member in the original Combination by the specified quantity.
     * If the member id is provided, and the member is not in the original Combination, an error will be thrown.
     *
     * @param {string | T} memberToDecrement - The ID or instance of the member element to decrement in the original Combination.
     * @param {number} [quantity=1] - The quantity to decrement the specified member by (default is 1).
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified member.
     * @throws Will throw an error if the memberToIncrement is null, or the member ID is not found in the original Combination.
     */
    decrement(memberToDecrement: string | T, quantity: number): Combination<T>;

    /**
     * Subtracts the quantity of the specified Unit from the original Combination, without altering it,
     * and returns a new Combination with the updated quantity.
     *
     * @param {Unit<T>} subtractedUnit - The Unit to subtract its quantity from the original Combination.
     * @returns {Combination<T>} A new Combination with the updated quantity for the specified Unit's member.
     * If the updated quantity is less than or equal to zero, the member is removed from the new Combination.
     */
    subtractUnit(subtractedUnit: Unit<T>): Combination<T>;

    /**
     * Subtracts the quantities of the members in the provided Combination from the original Combination, without altering it,
     * and returns a new Combination representing the result of the subtraction operation.
     *
     * @param {Combination<T>} other - The other Combination representing the amounts to remove.
     * @returns {Combination<T>} A new Combination, resulting from the subtraction of the other Combination from this one.
     * If the updated quantity for a member is less than or equal to zero, the member is removed from the new Combination.
     */
    subtract(other: Combination<T>): Combination<T>;

    /**
     * Removes the specified member from the original Combination without altering it and returns a new Combination
     * representing the result.
     *
     * @param {T} memberToRemove - The member to remove from the original Combination.
     * @param {number} [amountToRemove] - The amount of the member to remove. If not specified, the member is removed
     *  from the Combination regardless of its current quantity. If provided, the member is only removed if its current
     *  quantity is equal to or less than the specified amount. Otherwise, the member's current quantity is reduced by
     *  the specified amount.
     * @returns {Combination<T>} A new Combination with the specified member removed.
     */
    without(memberToRemove: T | string, amountToRemove?: number): Combination<T>;

    /**
     * Adds the specified member in the specified quantity to the combination without altering it and returns a new
     *  Combination representing the result.
     *
     * @param memberToAdd - The member to add to the Combination.
     * @param amountToAdd - The amount of the member to add.
     * @returns {Combination<T>} A new Combination with the specified member added.
     */
    with(memberToAdd: T, amountToAdd: number): Combination<T>;

    /**
     * Multiplies the quantity of each member in the original Combination by the provided factor without altering it,
     * and returns a new Combination representing the result of the multiplication operation.
     *
     * @param {number} factor - The factor by which to multiply the quantity of each member in the original Combination.
     * @returns {Combination<T>} A new Combination with updated quantities for each member, resulting from the multiplication.
     */
    multiply(factor: number): Combination<T>;

    /**
     * Checks if the original Combination intersects with the provided Combination, i.e., if they share any common members.
     *
     * @param {Combination<T>} other - The other Combination to check for intersection with the original Combination.
     * @returns {boolean} True if the original Combination and the provided Combination share any common members, otherwise false.
     */
    intersects(other: Combination<T>): boolean;

    /**
     * Transforms the original Combination into a new Combination of a different type by applying the provided transformFunction
     * to each member. The transformFunction returns a new Combination for each member in the original Combination. The quantities
     * of the resulting Combinations are multiplied by the original member's quantity before being merged into the final
     * Combination.
     *
     * @template R - The type of the resulting Combination.
     * @param transformFunction - The function to transform the members of the original Combination into Combinations of
     *  the new type.
     * @returns {Combination<R>} A new Combination of type R, resulting from the transformation and merging of the original
     *  Combination's members.
     */
    explode<R extends Identifiable>(transformFunction: (thisType: T) => Combination<R>): Combination<R>;

    /**
     * Checks if the original Combination is equal to the provided Combination. Two Combinations are considered equal
     * if they have the same size and contain the same members with the same quantities.
     *
     * @param {Combination<T>} other - The other Combination to compare with the original Combination.
     * @returns {boolean} True if the original Combination and the provided Combination are equal, otherwise false.
     */
    equals(other: Combination<T>): boolean;

    /**
     * Converts the Combination to a JSON representation, mapping the member ID to its quantity.
     *
     * @returns {Record<string, number>} A JSON object with member IDs as keys and their corresponding quantities as
     *  values.
     */
    toJson(): Record<string, number>;

    /**
     * Converts the combination to an Array of the specified type, by applying the provided mappingFunction to each
     *  unit. The mappingFunction receives a copy of each unit within the original combination, so that it can be
     *  safely modified without side effects.
     *
     * @param mappingFunction - The function to apply to each unit in the combination.
     * @returns R[] An array of type R, resulting from the conversion of the original combination's units.
     */
    map<R = any>(mappingFunction: (unit: Unit<T>) => R): R[];

    /**
     * Converts the Combination type to a new type by applying the provided conversionFunction to each unit.
     *  The conversionFunction receives a copy of each unit within the original Combination, so that it can be safely
     *  modified without side effects.
     *
     * @param conversionFunction - The function to apply to each unit in the Combination.
     * @returns Combination<R> A new Combination of type R, resulting from the conversion of the original Combination's
     *  units.
     */
    convertUnits<R extends Identifiable>(conversionFunction: (unit: Unit<T>) => Unit<R>): Combination<R>;

    /**
     * Converts the Combination elements to a new type by applying the provided conversionFunction to each element
     *  without modifying the quantity.
     *
     * @param conversionFunction - The function to apply to each element in the Combination.
     * @returns Combination<R> A new Combination of type R, resulting from the conversion of the original Combination's
     *  elements.
     */
    convertElements<R extends Identifiable>(conversionFunction: (element: T) => R): Combination<R>;

    /**
     * Computes the intersection of the original Combination with the provided Combination, i.e., the Combination
     *  containing only the members that are present in both Combinations with the minimum quantity of the two.
     *
     * @param other - The other Combination to compute the intersection with.
     * @returns {Combination<T>} A new Combination containing only the members that are present in both Combinations
     *  with the minimum quantity of the two.
     */
    intersectionWith(other: Combination<T>): Combination<T>;

}
```

</details>

## Unit

A `Unit` is a data structure that represents a member of a `Combination`, with an associated quantity.

<details markdown="block">
<summary>
The Unit interface
</summary>

```typescript
/**
 * Represents a single unit with an associated quantity of an Identifiable object.
 * The unit quantity can be manipulated without altering the original object. Units are immutable.
 *
 * @template T - A type that extends the Identifiable interface.
 */
interface Unit<T extends Identifiable> {

    /**
     * @returns {T} The Identifiable element of the unit.
     */
    readonly element: T;

    /**
     * @returns {number} The quantity of the unit.
     */
    readonly quantity: number;

    /**
     * Adds a specified amount to the current quantity of the unit by creating a new Unit instance without altering the
     *  original.
     *
     * @param {number} amount - The amount to add to the current quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    add(amount: number): Unit<T>;

    /**
     * Subtracts a specified amount from the current quantity of the unit by creating a new Unit instance without
     *  altering the original. Optionally applies a floor to the resulting quantity.
     *
     * @param {number} amount - The amount to subtract from the current quantity.
     * @param {number} [floor] - Optional floor to apply to the resulting quantity.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    minus(amount: number, floor?: number): Unit<T>;

    /**
     * Inverts the quantity of the unit (multiplies the quantity by -1) by creating a new Unit instance without altering
     *  the original
     *
     * @returns {Unit<T>} A new Unit instance with the inverted quantity.
     */
    invert(): Unit<T>;

    /**
     * Creates a new Unit instance with the same identifiable object and the specified quantity without altering the
     *  original
     *
     * @param {number} amount - The quantity to set for the new Unit instance.
     * @returns {Unit<T>} A new Unit instance with the specified quantity.
     */
    withQuantity(amount: number): Unit<T>;

    /**
     * Multiplies the unit quantity by a specified factor by creating a new Unit instance without altering the original
     *
     * @param {number} factor - The multiplication factor.
     * @returns {Unit<T>} A new Unit instance with the updated quantity.
     */
    multiply(factor: number): Unit<T>;

    /**
     * Combines the current Unit with another Unit of the same type by creating a new Unit instance without altering the
     * original. The resulting Unit will have a quantity equal to the sum of both unit quantities.
     *
     * @param {Unit<T>} other - The other Unit to combine with the current Unit.
     * @returns {Unit<T>} A new Unit instance with the combined quantities.
     */
    combineWith(other: Unit<T>): Unit<T>;

    /**
     * Creates a new Unit instance with the same identifiable object and quantity.
     */
    clone(): Unit<T>;

}
```

</details>

## Component selection

A `ComponentSelection` is a data structure that represents a selection of components to meet a set of targets for catalyst, ingredient and essence amounts.

<details markdown="block">
<summary>
The ComponentSelection interface
</summary>

```typescript
/**
 * Represents a selection of components and a target amount
 */
interface ComponentSelection {

    /**
     * Indicates whether the selection contains enough components to meet the targets
     */
    isSufficient: boolean;

    /**
     * The components that are selected as catalysts, as well as the target amounts for each
     */
    catalysts: TrackedCombination<Component>;

    /**
     * The components that are selected as ingredients, as well as the target amounts for each
     */
    ingredients: TrackedCombination<Component>;

    /**
     * The cumulative essences present in essence sources, as well as the target amounts for each
     */
    essences: TrackedCombination<Essence>;
    
    /**
     * The components that are selected as sources for the required essences, as well as the target amounts for each
     */
    essenceSources: Combination<Component>;

}
```

</details>




