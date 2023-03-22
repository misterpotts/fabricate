---
layout: page
title: Editing
permalink: /recipes/editing/
parent: Recipes
nav_order: 1
---

# Editing recipes
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Adding recipes to a crafting system

Adding recipes to a crafting system is an essential first step to configuring them and making them available to users.
Once you've added a recipe, you can define its requirements in terms of ingredients and catalysts, as well as raw essences from amongst other components.

To add a recipe to a crafting system, simply navigate to the "Recipes" tab in the crafting system manager.
This will open the recipe browser. 
Make sure that you've selected the crafting system you want to add the recipes to from the left menu.
Then, simply drag and drop the items into the drop zone beneath "Add a recipe to `{my system}`".
Fabricate will add the recipe to the crafting system and display a notification confirming it was successfully added.

![](/fabricate/img/adding-recipes.gif)

## Adding recipe ingredients, catalysts and results

A recipe needs results to produce something when crafted. 
Most simple recipes require a specific set of ingredients, and may also require catalysts to be present.

To add these to your recipe, find the recipe in the recipe browser.
Then, click the "Edit" button.
This will open the recipe editor.
Once here, you can drag and drop components from the available components in the right column, to the requirements option on the left.
You can choose to add the component as a catalyst, or an ingredient.

Dragging another of the same component will **increase** the quantity.
However, the quickest way to do that is to left-click a component already present in the salvage option.
You can **reduce** the quantity of components and remove them from requirements by right-clicking (or shift-clicking) them.

To manage results, simply switch to the results tab and do the same.

![](/fabricate/img/adding-recipe-requirements-and-results.gif)

## Multiple requirement and result options

You can specify multiple options for recipe requirements, as well as results.
This will provide players with a choice when salvaging the component.

To add anew option for either requirements or results, simply click "New" next to the current option.
Then, drag and drop a component into the drop zone to create an additional option.
You can edit this option in the same way as others.
You can rename options, changing the text that is displayed to players when choosing between them.
Additionally, you can remove an option by clicking "Delete" to the right of the option name.

![](/fabricate/img/multiple-recipe-options.gif)

## Manage recipe essences

You can add and remove your crafting system's [essences](/fabricate/essences) from a recipe's requirements easily.
Just open up the recipe editor and scroll down to the "Essences" section.
Use the "+" (plus) and "-" (minus) buttons to the left and right of each essence name to increment or decrement the quantity required by the recipe.
These essences are required in addition to any catalysts and specific ingredients.
However, they maybe sourced from any components in the actor's inventory.

![](/fabricate/img/manage-recipe-essences.gif)