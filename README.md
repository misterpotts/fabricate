![](https://img.shields.io/badge/Foundry-v10-informational)
<!--- Downloads @ Latest Badge -->
![Latest Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/latest/total?sort=semver&style=for-the-badge)
<!--- Downloads @ Total Badge -->
![Total Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/total?label=total%20downloads&style=for-the-badge)
<!--- Patreon Badge -->
[![Support me on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dmisterpotts%26type%3Dpatrons&style=flat-square)](https://patreon.com/misterpotts)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffabricate&colorB=4aa94a) -->

![](/screens/fabricate-repo-preview.png)

# Fabricate

Fabricate is a system-agnostic, flexible crafting module for FoundryVTT. 
The current version is in the late stages of development. 
It is working towards back-filling functionality of "Alchemist's Supplies V1.6" by [/u/calculuschild](https://www.reddit.com/user/calculuschild/) for Foundry VVT Version 10+. 
Once complete, Fabricate will ship with several crafting systems for D&D 5E.

Here's a quick preview of the early features.

## Creating Crafting Systems

At the moment a crafting system is little more than a group of related components, essences and recipes.
As Fabricate receives new features, it will define a set of behaviours, checks and rules to provide a complete, custom framework for crafting.

![](/screens/fabricate-system-creation.gif)

## Creating Essences 

Essences are a quality of a component. 
They define something that the component has, not something that it is. 
Components might have multiple Essences in different quantities, all of which you can define for your system.

![](/screens/fabricate-essence-creation.gif)

## Creating Crafting Components

You can turn any items into crafting components.
These are the items that your crafting system consumes and produces. 
They can be consumables, like potions.
They might be equipment, like armour and weapons. 
Equally, they can be trinkets used as ingredients, such as "Iron Ore" or an "Adult Blue Dragon Tooth".
You can imbue them with Essences, as well as define the components that can be salvaged by breaking them down.

![](/screens/fabricate-component-editing.gif)

# FAQ

> Why don't I see Fabricate in the official [list of modules](https://foundryvtt.com/packages/modules)

Because it's not finished, and therefore not released yet.

> When will Fabricate be released?

When it's done.
I want to finish core crafting and alchemy before then, as well as having some time to test it with a smaller audience.

> Will Fabricate be free?

Yes, but don't let that stop you supporting me on [Patreon](https://patreon.com/misterpotts) if you appreciate what I'm doing.

# Changelog

The most recent changes to Fabricate are documented here.

## Version 0.7.0

- Support for v10
- Localization and support for English
- Create, duplicate and delete crafting systems
- Create, edit and delete essences
- Import items to create components, as well as delete them
- Add and remove essences and salvage from components

If you'd like to be involved I'd love to have some help! I'm always happy to talk to you about how people can contribute.

# License

This software is distributed with an MIT License.

# Attribution

This project is based on a FVTT Typescript Module [Template](https://github.com/League-of-Foundry-Developers/foundry-typescript-template).
The template was provided by the League of Extraordinary Foundry Developers and is attributed to Spacemandev.

## Crafting systems

- "Alchemist's Supplies" belongs to /u/calculusChild and is bundled with Fabricate with their consent 

## Other Acknowledgements

Thanks are due to The League of Extraordinary Foundry Developers, in particular to their members `valravn#7351`, `ghost#2000`, `BadIdeasBureau#7024` and `Calego#0914`. Join their Discord below.

[![Discord](https://img.shields.io/discord/591914197219016707.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/DrrcCtKF4C)