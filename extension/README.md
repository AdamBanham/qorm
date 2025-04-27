# qORMa - An ORM editor for vscode

This extension is a simple and "lightweight" implementation of the ORM schema. The project is a work in progress and aims to capture the minimum features of the full ORM language. It provides a diagram interface suited to ORM models. It builds on top of the Camunda framework [diagram-js](https://github.com/bpmn-io/diagram-js).

## Features

At this stage, we support the following components of the ORM language:
- Entities
    - Referenced or unit-based referenced
- Value Entities
    - with a single name
- Facts
    - of any desired arity
    - uniqueness constraints
    - derivation labels
    - objectified (limited support)
    - connections between facts and entities
        - mandatory roles on connections

For instance, you can see the graphical representation of these elements in the following snippet:

![image](/extension/extension-assets/entities-and-values.png)

## Requirements

The editor does not require installation. If you have vscode installed, then you have everything you need.

## Extension Settings

We currently do not expose any settings for the extension.

## Release Notes

The following section capture the most recent releases.

### 0.1.0

Initial release of the ORM editor for testing purposes.
