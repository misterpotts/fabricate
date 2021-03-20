![](https://img.shields.io/badge/Foundry-v0.7.9-informational)
<!--- Downloads @ Latest Badge -->
![Latest Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/latest/total?sort=semver&style=for-the-badge)
<!--- Downloads @ Latest Badge -->
![Total Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/total?label=total%20downloads&style=for-the-badge)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffabricate&colorB=4aa94a) -->

![](/screens/fabricate-repo-preview.png)

# Fabricate

Fabricate is a system-agnostic, flexible crafting module for FoundryVTT. The current version is in the late stages of 
development. It supports the majority of the functionality of "Alchemist's Supplies V1.6" by [/u/calculuschild](https://www.reddit.com/user/calculuschild/). 
Once complete, Fabricate will ship with several crafting systems, but initial support will be limited to D&D 5E.

Here's a quick preview of one of the early features - crafting from a Recipe that requires component essences.

![](/screens/fabricate-preview-3.gif)

Crafting from components containing essences without a recipe.

![](/screens/fabricate-preview-5.gif)

# Changelog

The most recent changes to Fabricate are documented here.

## Version 0.5.6

- The Actor crafting tab now lists owned and known recipes 
- Known and owned recipes with sufficient ingredients can be crafted from the actor crafting tab
- Known and owned recipes with insufficient ingredients are disabled in the select box
- Crafting results are now written to the game chat  
- Refactored the Fabricator significantly to enable crafting checks, failure outcomes and other upcoming features
- Chat messages are significantly improved 
- Crafting tab no longer lists unusable items when crafting from components to combine essences 
- Crafting tab no longer lists recipes to craft if none can be crafted
- Recipe tab no longer allows attempting to craft recipes with insufficient owned components 

## Version 0.4.0
- The D&D 5E Actor Sheet now displays a crafting tab for systems that support 5E
- The Actor5E Crafting Tab lists:
    - the total number of crafting components across any number and combination of inventory items for the same
    - the craftable recipes from the selected crafting system
    - the crafting systems thatcan be selected to craft from
- The Actor5E Crafting Tab supports crafting without a recipe for Alchemist's Supplies (v1.6 Alchemical Bombs only)

If you'd like to be involved I'd love to have some help! I'm always happy to talk to you about how people can contribute.

# License
This software is distributed with an MIT License.

# Attribution
This project is based on a FVTT Typescript Module [Template](https://github.com/League-of-Foundry-Developers/foundry-typescript-template) provided 
by the League of Extraordinary Foundry Developers and attributed to Spacemandev.

## Crafting systems

- "Alchemist's Supplies" belongs to /u/calculusChild and is bundled with Fabricate with their consent 

## Other Acknowledgements

Thanks are due to The League of Extraordinary Foundry Developers, in particular to their members `valravn#7351`, `ghost#2000`, `BadIdeasBureau#7024` and `Calego#0914`. Join their Discord below.

[![Discord](https://img.shields.io/discord/591914197219016707.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/ymTxJECYeg)
