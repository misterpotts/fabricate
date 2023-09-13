---
layout: page
title: Editing
permalink: /components/editing/
parent: Components
nav_order: 1
---

# Editing components
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Adding components to a crafting system

Adding components to a crafting system makes them available to include in recipes.
You can also define salvage for components and add essences to them.

To add a component to a crafting system, simply navigate to the "Components" tab in the crafting system manager.
This will open the component browser. 
Make sure that you've selected the crafting system you want to add the components to from the left menu.
Then, simply drag and drop the items into the drop zone beneath "Add a component to `{my system}`".
Fabricate will add the component to the crafting system and display a notification confirming it was successfully added.

![](/fabricate/img/adding-components.gif)

## Adding salvage to a component

Adding salvage to a component makes it salvageable. 
As long as a component has at least one salvage option it can be salvaged. 

To add your first salvage option to a component, find the component in the component browser.
Then, click the "Edit" button.
This will open the component editor.
Once here, you can drag and drop components from the available components in the right column, to the salvage option on the left.

You can add other components as salvage results, or catalysts.
Catalysts are components that are required to salvage the component, but are not consumed during the process.
For example, a "Forge" might be required to salvage a "Broken Sword", but the forge is not consumed in the process.
Salvage results are the components that are produced by salvaging the component.

Dragging another of the same component will **increase** the quantity.
However, the quickest way to do that is to left-click a component already present in the salvage option.
You can **reduce** the quantity of components and remove them from salvage by right-clicking (or shift-clicking) them.

![](/fabricate/img/adding-component-salvage.gif)

## Multiple salvage options

You can specify multiple options for component salvage.
This will provide players with a choice when salvaging the component.

To add a new option, simply click "New" next to the current option.
Then, drag and drop a component into the drop zone to create an additional salvage option.
You can edit this option in the same way as others.
You can rename options, changing the text that is displayed to players when choosing between them. 
Additionally, you can remove an option by clicking "Delete" to the right of the option name.

![](/fabricate/img/multiple-component-salvage-options.gif)

## Manage component essences

You can add and remove your crafting system's [essences](/fabricate/essences) from a component easily.
Just open up the component editor and scroll down to the "Essences" section.
Use the "+" (plus) and "-" (minus) buttons to the left and right of each essence name to increment or decrement the quantity present in the component.

![](/fabricate/img/manage-component-essences.gif)