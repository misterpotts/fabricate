---
layout: page
title: Recipes
permalink: /recipes/
has_children: true
---

# Recipes

The most important thing in a system is its recipes. 
Recipes define what you can make, and what you need to make it.

Recipes have 3 important properties:

- **Ingredients:** Components the recipe consumes
- **Catalysts:** Components that must be present to craft the recipe, but which are not consumed
- **Essences:** Essences required from amongst available components to craft the recipe, in addition to any ingredients and catalysts.
Extracting essences from Ingredients consumes them
- **Results:** The components the recipe produces

## Options

The simpler a recipe is, the easier it will be to use.
However, you might encounter a situation that requires you to offer multiple options for the requirements for, or results of, a single recipe.

For example, imagine that you want to create a system for repairing worn and broken gear.
In that system, let's say that we have 3 levels of condition for a shield as separate items:

1. Shiny shield
2. Dull shield
3. Broken shield

We can create a single recipe for shield repair, with two requirement options, and one result option:

- `1 x Dull Shield + 1 x Polish -> Shiny Shield`, or
- `1 x Broken Shield + 1 x Iron + 1 x Wood -> Shiny Shield` 

Recipes can have one or more options for their requirements (ingredients and catalysts) as well as having options for their results.

## Upgrade paths

As recipes produce components, you can set up multiple recipes in a chain to create upgrade paths for items. E.g:

- `"Healing Root" -> "Healing Potion"`
- `"Healing Potion" + "Pixie Dust" -> "Better Healing Potion"`