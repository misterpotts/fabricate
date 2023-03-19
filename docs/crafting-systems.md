---
layout: page
title: Crafting Systems
permalink: /crafting-systems/
---

# Crafting systems
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## What is a crafting system?

A crafting system is a set of Components and Recipes subject to a consistent set of rules.
For example, all recipes in a given crafting system may require a successful D20 check to perform. 
The calculations for and methodology for that check are consistent across all recipes in the system.
If you add a component or recipe to a system, it too becomes subject to these same rules.

## Opening the crafting system manager

To open the crafting system manager, first, open the Item tab in the right menu.
Then click the Crafting Systems button to open Fabricate's Crafting system manager.

![](/fabricate/img/crafting-system-button.webp)

If you're opening Fabricate in a Game World for D&D 5th Edition, you'll see an embedded system already listed.

![](/fabricate/img/crafting-system-manager.webp)

If not, you'll see an empty crafting system manager, like so.

![](/fabricate/img/crafting-system-manager-empty.webp)

## Creating a crafting system

Creating a crafting system is easy!
Just open the crafting system manager and click "Create" in the lower left hand corner.
Fabricate will create a new crafting system with some placeholder details populated for you.
You'll see the new system appear in the left navigation.
Fabricate will switch you to view the new system and you can start customising its details.

![](/fabricate/img/create-a-crafting-system.gif)

## Exporting a crafting system

Exporting a crafting system is just as straightforward.
Select the crafting system you want to export in the crafting system manager.
This will display a menu containing the "Export" option.
Select that and Fabricate will export the crafting system to a JSON file and prompt you to save it on your computer.

![](/fabricate/img/export-a-crafting-system.gif)

## Importing a new crafting system

To import a new crafting system, click the "Import New" button in the lower left of the crafting system manager.
Fabricate will open a dialogue that prompts you to select a file to upload.
Once you have done so, click the "Import" button on the dialogue to complete the process.
Fabricate will switch you to view the new system and you can start customising its details.

![](/fabricate/img/import-a-crafting-system.gif)

## Deleting a crafting system

Deleting a crafting system removes all the information about its recipes and components that you have configured in Fabricate.
Only the data managed by Fabricate is removed.
None of the Foundry Items used by Fabricate will be impacted when a crafting system is deleted.

{: .highlight }
> This action is permanent and cannot be reversed.
> If you want to retain your data, [export your crafting system](#exporting-a-crafting-system) before deleting it.

To delete a crafting system, select the crafting system you want to delete in the crafting system manager.
This will display a menu containing the "Delete" option.
Click that, and Fabricate will open a dialogue that prompts you to confirm your decision.
Click "Yes"and Fabricate will delete the crafting system.

![](/fabricate/img/delete-a-crafting-system.gif)

## Overwriting a crafting system

Updating, or overwriting, an existing crafting system from an external file is straightforward. 
You can edit the file before importing, changing any aspect of the crafting system details.
This includes any components and recipes.
If you do, be sure not to modify the crafting system ID.
This has to match the ID of the crafting system you want to overwrite.

To overwrite a crafting system, select the crafting system you want to export in the crafting system manager.
This will display a menu containing the "Import" option.
Click that, and Fabricate will open a dialogue that prompts you to select a file to upload.
Once you have done so, click the "Import" button on the dialogue to complete the process.

![](/fabricate/img/overwrite-a-crafting-system.gif)

## Duplicating a crafting system

When you duplicate a crafting system, Fabricate creates a copy of the source system.
The copy contains all the components and recipes configured in the source system.
However, editing, removing, and adding recipes and components in the copy will not affect the source system.
Duplicating a crafting system can be a useful tool for testing out changes to your systems without altering a system currently being used.

To duplicate a crafting system, select the crafting system you want to export in the crafting system manager.
This will display a menu containing the "Duplicate" option.
Click that, and Fabricate will create a copy of the system with "(copy)" appended to the name.
You'll see the new system appear in the left navigation.
Fabricate will switch you to view the new system and you can start customising its details.

![](/fabricate/img/duplicate-a-crafting-system.gif)

## Disabling a crafting system

Disabling a crafting system functionally "turns it off".
Its components cannot be salvaged.
Its recipes cannot be crafted.
None of the Foundry items included in the system will prompt users to craft with them using Fabricate (unless they included in another crafting systems).

![](/fabricate/img/disable-crafting-system-button.webp)