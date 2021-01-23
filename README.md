![](https://img.shields.io/badge/Foundry-v0.7.9-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
<!--- ![Latest Release Download Count](https://img.shields.io/github/downloads/misterpotts/fabricate/latest/module.zip) -->

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffabricate&colorB=4aa94a) -->

# Changelog
Version 0.0.1 is not yet usable! :( I'm still in the early stages of figuring out FoundryVTT development and re-learning
Typescript. 

# Description
Fabricate is a module for FoundryVTT in the early stages of development. It's my first module, and my first TypeScript
project in almost 10 years. 

Once complete, Fabricate will provide a game-system-agnostic crafting system for FoundryVTT.

If you'd like to be involved I'd be happy to talk to you about how you could help out.

## Manifest Plus
Adds the following fields to the manifest for package browsers to pick up and show information better:

```
- includes: [] # list of files to include in the zip
- icon: "" # link to icon img
- cover: "" #link to cover img
- screenshots: [] #links to screenshot images
- video: ""
- authors: [
    {
      "name": "misterpotts",
      "email": "matt@misterpotts.uk"
    }
]
```

## Versioned Releases

The Github Actions script will automatically create a Latest release which will always have a module.json that points to
the latest release, and a versioned release whenever you update the version in your module.json. 

This allows people who depend on a specific version of your module to just install that and be version locked. The 
versioned releases will *not* auto update.

# License
MIT License. PRs welcome.