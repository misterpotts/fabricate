---
layout: page
title: Hooks
permalink: /api/hooks/
parent: API
nav_order: 8
---

# Hooks
{: .no_toc }

Fabricate publishes a number of events through Foundry's `Hooks` API.
These events can be used to integrate with the module and extend Fabricate's behaviour.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## `fabricate.ready`

This hook is fired when Fabricate has finished initialising.
It is fired after the Foundry `ready` hook.

Listeners are passed a reference to the [Fabricate API](/fabricate/api#fabricate-api) instance, as well as the [Fabricate User Interface API](/fabricate/api#fabricate-user-interface-api) instance.

```typescript
Hooks.on('fabricate.ready', (fabricateAPI: FabricateAPI, fabricateUserInterfaceAPI: FabricateUserInterfaceAPI) => {
    // Do something with the API
    myModule.doSomethingwithThe(fabricateAPI);
    // Do something with the UI API
    myModule.doSomethingWithThe(fabricateUserInterfaceAPI);
});
```