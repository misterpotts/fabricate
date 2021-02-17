![](https://img.shields.io/badge/Foundry-v0.7.9-informational)
<!--- Downloads @ Latest Badge -->
![Latest Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/latest/module.zip)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffabricate&colorB=4aa94a) -->

![](/screens/fabricate-repo-preview.png)

# Fabricate

Fabricate is a system-agnostic, flexible crafting module for FoundryVTT. The current version is in the late stages of 
development. It supports the majority of the functionality of "Alchemist's Supplies V1.1" by [/u/calculuschild](https://www.reddit.com/user/calculuschild/). 
Once complete, Fabricate will ship with several crafting systems, but initial support will be limited to D&D 5E.

Here's a quick preview of one of the early features - crafting from a Recipe that requires component essences.

![](/screens/fabricate-preview-3.gif)

# Changelog

The most recent changes to Fabricate are documented here.

## Version 0.3.0
- Crafting from component essences is now possible for all alchemical recipes in "Alchemist's Supplies V1.1" by [/u/calculuschild](https://www.reddit.com/user/calculuschild/)
- A placeholder crafting tab exists on the Actor
- Resolved defects [#1][i1] and [#9][i9]

[i1]: https://github.com/misterpotts/fabricate/issues/1
[i9]: https://github.com/misterpotts/fabricate/issues/9

## Version 0.2.0
- Crafting now considers and decrements quantities from owned items in an actor's inventory when crafting and consuming components

## Version 0.1.0
- Support for the D&D 5E Game System in foundry
- Crafting can now be performed from a recipe in an actor's inventory - just open the item sheet, go to the Recipe tab and click 'Craft'

If you'd like to be involved I'd love to have some help! I'm always happy to talk to you about how people can contribute.

# License
This software is distributed with an MIT License.

# Attribution
This project is based on a FVTT Typescript Module [Template](https://github.com/League-of-Foundry-Developers/foundry-typescript-template) provided 
by the League of Extraordinary Foundry Developers and attributed to Spacemandev.

## Crafting systems

- "Alchemist's Supplies" belongs to /u/calculusChild and is bundled with Fabricate with their consent 

## Other Acknowledgements

Thanks are due to The League of Extraordinary Foundry Developers, in particular to their members `ghost#2000`, `BadIdeasBureau#7024` and `Calego#0914`. Join their Discord below.

[![Discord](https://img.shields.io/discord/591914197219016707.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/ymTxJECYeg)