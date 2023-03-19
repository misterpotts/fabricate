---
layout: page
title: Essences
permalink: /essences/
---

# Essences
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## What are essences?

Essences are a quality of a component. 
They define something that the component **has**, not something that it is. 
Components might have multiple Essences in different quantities, all of which you can define for your system.

To illustrate, let's imagine an "Adult Blue Dragon Tooth" as a crafting component. 
I might decide that it has a quality of elemental magic to it that is important to my system. 
In this case, I'll say that my "Adult Blue Dragon Tooth" has 2 Essences of "Elemental Lightning". 
I could also decide that a magical plant called "Thunder Root" contains the same Essence, but only 1 of them. 
In this example system, I can get 2 Essences of "Elemental Lightning" from either 1 "Adult Blue Dragon Tooth" or two "Thunder Root".

Why is this useful? 
Simply put, it allows you to create crafting systems with flexible recipes that support crafting an item from any components that have the right qualities, in the right quantities.

Essences are optional - if your system doesn't need them to work, you don't need to define them at all.

## Creating and editing an essence

To add an essence to a crafting system, simply navigate to the "Essences" tab in the crafting system manager.
This will open the essence editor.
Make sure that you've selected the crafting system you want to add the essence to from the left menu.

Once there, click the "New Essence" button to create an essence with some placeholder properties.
You can edit these in the essence editor.

| Property                                                | Description                                                                                                     |
|---------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| [Active effect source](#managing-active-effect-sources) | An optional item from which to transferactive effects to items created from components thatcontain this essence |
| Icon                                                    | The icon for your essence, selected from [FontAwesome's free icons](https://fontawesome.com/search?m=free&o=r)  |
| Name                                                    | The name of your essence, used wherever the essence is referenced                                               |
| Tooltip                                                 | The tooltip that is displayed whenever the essence icon is hovered                                              |
| Description                                             | A description of the essence and what it represents in your world or crafting system                            |

Click the essence's current icon to open the icon selection modal window.
You can either scroll through the available icons, or enter a search term to narrow the selection based on the icon name.

![](/fabricate/img/creating-essences.gif)

## Managing active effect sources

To **add** an active effect source to an essence, simply drag and drop an item onto the drop zone to the right of the "Active Effect Source" label.

Right-click the item icon to the right of the "Active Effect Source" label to **remove** an active effect source.

To **replace** an active effect source to an essence, just drag and drop an item onto the item icon to the right of the "Active Effect Source" label.

![](/fabricate/img/managing-active-effect-sources.gif)

## Deleting an essence

Deleting an essence removes it from the crafting system, as well as any crafting components and recipes that reference it.

{: .highlight }
> This action is permanent and cannot be reversed.
> If you want to retain your data, [export your crafting system](#exporting-a-crafting-system) before deleting essences from it.

To delete an essence, just click the "Delete Essence" button beneath the essence you want to remove.
Fabricate will open a dialogue that prompts you to confirm your decision. 
Click “Yes” and Fabricate will delete the essence.

{: .important }
You can skip this dialogue by holding the **shift** key when you click the delete button.

![](/fabricate/img/delete-an-essence.gif)