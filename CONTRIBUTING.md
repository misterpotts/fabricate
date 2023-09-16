# Contributing to Fabricate

Thank you for your interest in contributing!
Any contributions you make will be reflected in this repository's [contributor insights](https://github.com/misterpotts/fabricate/graphs/contributors).
More prolific contributors are also likely to get a shout-out in the [README](README.md).

Please always be respectful to other contributors, maintainers, and module users.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

Use the table of contents icon in the top left corner of this document to get to a specific section of this guide quickly.

## New contributor guide

To get an overview of the project, read the [README](README.md). 
If you're new to open-source, here are some resources to help you get started with making contributions:

- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [Working with GitHub Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

To navigate the codebase with confidence, see [the introduction to working on Fabricate](#introduction-to-working-on-fabricate) :confetti_ball:.

Check to see what [types of contributions](#types-of-contributions) we accept before making changes. 
Some of them don't even require writing a single line of code :sparkles:.

### Introduction to working on Fabricate

Check out the section on [building Fabricate](README.md#building-fabricate) in [README.md](README.md).
Get your local development environment set-up and the local installation process working.

Ideally, every medium to large change should have an Issue where we can discuss the new behaviour and content, as well as potential solutions, before you get started working.
Smaller changes can be made without an issue, but you should still open one if you want to discuss the change with the maintainers in advance.

Contributions should also be small.
The ideal change size is under 200 new lines of code.
You can still submit larger changes, but you may be asked to break them down to make them easier to review.

Please try to avoid submitting opinionated changes unless the maintainers have requested, or agreed to them.
An example of an opinionated change would be switching from Less CSS to Sass, or from Jest to Mocha.
You should expect that those types of changes will be rejected if they have not been discussed with the maintainers beforehand.

### Types of contributions

### :mega: Discussions

Discussions are where we have conversations.

If you'd like help troubleshooting a PR you're working on, have a great new idea, or want to share something amazing you've learned, you can join or start a [discussion](https://github.com/misterpotts/fabricate/discussions).

### :lady_beetle: Issues

[Issues](https://github.com/misterpotts/fabricate/issues) are used to track tasks that contributors can help with. 
If an issue has a triage label, it hasn't been reviewed yet, and you shouldn't begin work on it.

If you've found a bug or have an idea for a new feature, search open issues to see if someone else has reported the same thing or is already working on it. 
If it's something new, open an issue using a [template](https://github.com/misterpotts/fabricate/issues/new/choose). 
The issue will be used to have a conversation about the problem you want to fix.

### :hammer_and_wrench: Pull requests

A [pull request](https://github.com/misterpotts/fabricate/pulls) is a way to propose changes to Fabricate.
When those changes are merged, they become part of the next release. 
The maintainers will decide what and when to release, as well as making it happen.

### :question: Support

I am currently working on Fabricate alone.
Although I'm working hard to keep up with the documentation demands and feature backlog of a continuously changing module, that means I just can't help with support questions in this repository. 
If you have questions about the module and its usage, please join my [Discord](https://discord.gg/P5KVvSNKUZ) and ask in the [#fabricate](https://discord.gg/P5KVvSNKUZ) channel.
There is a small community of people there who can help you out if I'm not able to.

If you're having trouble with Foundry Virtual Tabletop, you should ask in a [Foundry Community](https://foundryvtt.wiki/en/home).

### :earth_asia: Translations

This module is internationalized, though there might be places that have been missed.
Fabricate is currently only available in **English**.
If you want to contribute a translation, please open an Issue and submit a Pull Request.
Translations will need to be reviewed and approved by the community before they can be accepted.
The maintainers will manage and arbitrate this process.

### Issues

#### Create a new issue

If you spot a problem or see an opportunity for a new feature, [search to see if an issue already exists](https://github.com/misterpotts/fabricate/issues). 
If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/misterpotts/fabricate/issues/new/choose).

#### Solve an issue

Scan through the [existing issues](https://github.com/misterpotts/fabricate/issues) to find one that interests you. 
You can narrow down the search using `labels` as filters.
As a general rule, issues won’t be assigned to anyone. 
Instead, we ask contributors to self-assign when they start work on an issue.
If you find an issue to work on, you are welcome to self-assign the issue and open a PR with the change.

### Make changes

1. Fork the repository
2. Install or update to **Node.js v18**
3. Create a working branch and start with your changes

### Commit your update

Commit the changes once you are happy with them. 
Don't forget to speed up the review process:zap:.

### Pull request

When you're finished with the changes, create a pull request, also known as a PR.

- Fill the template. 
This template helps reviewers understand your changes as well as the purpose of your pull request.
- Don't forget to l[ink the PR to an issue](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests) if you are solving one.
- Enable the checkbox to allow maintainer edits so the branch can be updated for a merge.
Once you submit your PR, someone will review your proposal. 
They may ask questions or request additional information.
- Review your own work first!
- Ensure that your change passes the CI test and build process.
If it doesn't pass first time, update your change until it does
- The reviewer may ask for changes to be made before a PR can be merged, either using suggested changes or pull request comments. 
You can apply suggested changes directly through the UI. 
You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as resolved

### Your PR is merged!

Congratulations :tada::tada: 

Once your PR is merged, your contributions will be publicly visible on the [contributor insights](https://github.com/misterpotts/fabricate/graphs/contributors).

Now that you are part of the Fabricate developer community, see how else you can [contribute](#contributing-to-fabricate).

## Principles

Fabricate is built to a set of technical principles that guide the development of the module.
If your change doesn't fit with these principles, it may be rejected.

### Prefer simple and expressive solutions to complex ones

Fabricate is built to be easy to use, as well as change.
Types and functions should be named in a way that makes their purpose clear.
They should be small, have a single responsibility, and be easy to understand.

### Prefer to solve problems with patterns than with novel structures

Fabricate aims to solve problems in a manner that is consistent across the codebase and familiar to developers from other projects and backgrounds.
If you are solving a problem that has been solved before, use a pattern from the existing codebase.
If you are solving a new problem, look to use an established [software design pattern](https://en.wikipedia.org/wiki/Software_design_pattern#) before going your own way.

### Prefer composition to inheritance

Fabricate uses composition over inheritance to solve problems.
This means that the behaviour of types is composed by collaborators on which they depend, rather than inheriting from a parent.
To this end, Fabricate uses [dependency inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle) to compose types.
This means that types depend on abstractions (interfaces), rather than concrete implementations.

### Prefer stubs to mocks

Fabricate uses [stubs](https://en.wikipedia.org/wiki/Test_stub) over [mocks](https://en.wikipedia.org/wiki/Mock_object) to test behaviour.
This helps to reduce the number of frameworks required to test the module and for new contributors to learn.
It also helps to reduce the complexity of the test suite.

### Prefer streams to loops or recursion

Fabricate uses [streams](https://en.wikipedia.org/wiki/Stream_processing) to perform operations on collections of data.
Steps in streams are sequential, declarative, easy to follow, and can be easier to test (where the step calls a function or uses a collaborator).
Fabricate also uses [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming) techniques over [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science)).
Recursion can be difficult to follow, and make it harder for contributors to reason about the behaviour of the code.