![](https://img.shields.io/badge/Foundry-v10-informational?style=for-the-badge)
<!--- Downloads @ Latest Badge -->
![Latest Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/latest/total?sort=semver&style=for-the-badge)
![Total Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/total?label=total%20downloads&style=for-the-badge)
<!--- Social badges -->
[![Support me on Patreon](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dmisterpotts%26type%3Dpatrons&style=for-the-badge)](https://patreon.com/misterpotts)
[![Discord](https://dcbadge.vercel.app/api/server/QNGn6cznJs)](https://discord.gg/QNGn6cznJs)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffabricate&colorB=4aa94a) -->

![](/screens/fabricate-repo-preview.png)

# About Fabricate

Fabricate is a system-agnostic, flexible crafting module for FoundryVTT. 
The current version is in the late stages of development. 
It is working towards back-filling functionality of "Alchemist's Supplies V1.6" by [/u/calculuschild](https://www.reddit.com/user/calculuschild/) for Foundry VVT Version 10+. 
Once complete, Fabricate will ship with at least one crafting system for D&D 5E.

# Installation

Follow the official guide on [Installing New modules](https://foundryvtt.com/article/modules/).
The first method is to use the manifest URL from the top level `module.json` file in the [latest release](https://github.com/misterpotts/fabricate/releases/latest) when ["_Installing via Manifest URL_"](https://foundryvtt.com/article/modules/).

Alternatively, a second approach is to download the `module.zip` archive from the [latest release](https://github.com/misterpotts/fabricate/releases/latest) when ["_Installing Modules Manually_"](https://foundryvtt.com/article/modules/).
If you do download the bundle `module.zip` manually, be mindful that the included manifest file **DOES NOT** contain valid download and manifest URLs.
If you want to install by manifest URL, use the first method.

Pre-releases can be installed using these same methods. 
However, the bundle and manifest URL are shared on [Patreon](https://www.patreon.com/posts/pre-release-76128822).

# Fabricate Features

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

> Why don't I see Fabricate in the official [list of modules](https://foundryvtt.com/packages/modules)?

Because it's not finished, and therefore not released yet.

> When will Fabricate be released?

When it's done.
I want to finish core crafting and alchemy before then, as well as having some time to test it with a smaller audience.

> Will Fabricate be free?

Yes, but don't let that stop you supporting me on [Patreon](https://patreon.com/misterpotts) if you appreciate what I'm doing.

# Changelog

Changes to Fabricate are documented on the [releases](https://github.com/misterpotts/fabricate/releases) themselves.

# Contributing

If you'd like to be involved I'd love to have some help! 
Take a look at the [contributing guide](CONTRIBUTING.md) and feel free to get in touch va [Discord](discordapp.com/users/MisterPotts#0255) or [email](mailto:matt@mrpotts.uk).
I'm always happy to talk to you about how people can contribute.

## Building Fabricate

Checkout the code on the `main` branch (SSL: `git@github.com:misterpotts/fabricate.git`) and install dependencies with:

```shell
npm install
```

Fabricate is built with [Vite](https://vitejs.dev/).
Vite builds the Fabricate JS bundle at a fraction of the size that Webpack did, and in a fraction of the time.

Build output files are written to the `/dist` directory in the project root. 
You can build the module by executing the following script:

```shell
npm run build
```

## Testing Fabricate

Fabricate uses Jest for testing. 
You can execute the test suite with the following command.

```shell
npm test
```

## Local Installation

Local installation is straightforward.
Just run the following command.

```shell
npm run releaseLocal
```

Fabricate will `test`, then `build` and finally copy the build output from the `/dist` directory to your local Foundry VTT Data directory.
There's no need to symlink directories.
This lets you use the development version of the Fabricate module straight away!
Just startup Foundry and enable Fabricate in module settings.

Fabricate installs the local build directly to your Foundry VTT Data Directory, under `/modules/fabricate`.
The default Foundry VTT Data Directory is `"../../dev-data/Data"`.
Fabricate assumes that you're doing local development with the following folder structure:

```
foundry-dev-root
- dev-data
  - Data (your Foundry VTT Data Directory)
    - modules
      - fabricate
      ... other locally installed modules
- dev-modules
  - fabricate
  ... other modules being developed
```

If you don't want to organise your projects how I do, you can set the `FVTT_DEV_DATA` environment variable to override the relative Foundry VTT Data Directory location.

```shell
export FVTT_DEV_DATA="relative-path/from-the-build-directory/to-your-FVTT/Data"
```

## Vite Development Server

You can run a local Vite development server once you've performed a local installation of Fabricate.
Vite will watch the build directory and rebuild the `/dist` directory when some source files change.
The Vite dev server will also intercept requests to `<LOCAL_FOUNDRY_HOST>/modules/fabricate/**` to serve these updated resources.
This enables live reload for CSS, which I find hugely boosts my productivity when working on Fabricate's UI.
I haven't figured out live reload for handlebars templates yet, but I'd like to.

To start the Vite dev server, run:

```shell
npm run serve
```

This will also open up a browser window at `http://127.0.0.1:30001/game`.
Use this window, **NOT** your local Foundry client, or direct access (typically at port `30000`) to use live reload during local development.

# License

This software is distributed with an MIT License.

# Attribution

Though it has changed significantly, this project was based on a FVTT Typescript Module [Template](https://github.com/League-of-Foundry-Developers/foundry-typescript-template).
The template was provided by the League of Extraordinary Foundry Developers and is attributed to Spacemandev.

## Crafting systems

- "Alchemist's Supplies" belongs to /u/calculusChild and is bundled with Fabricate with their consent 

## Other Acknowledgements

Thanks are due to The League of Extraordinary Foundry Developers, in particular to their members `valravn#7351`, `ghost#2000`, `BadIdeasBureau#7024`, `Calego#0914` and `Mana#4176`. 
Join their Discord below.

![League Discord](https://discordapp.com/api/guilds/732325252788387980/widget.png?style=banner1)

### Patron Hall of Fame

I'd also like to thank the following Patrons for their ongoing support, both on the platform and on Discord:

- Relic

It's an exclusive club at the moment!  
