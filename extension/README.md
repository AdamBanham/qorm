# qORMa - An ORM editor for vscode

This extension is a "lightweight" implementation of the ORM schema and provides 
a simple graphical interface for building ORM schemas. The project is a work 
in progress and aims to capture the minimum features of the whole ORM language. 
It provides a diagram interface suited to editing ORM schema, hopefully in an
intuitive manner. It builds on top of the Camunda framework 
[diagram-js](https://github.com/bpmn-io/diagram-js).

If you are after a more verbose and powerful tool to explore the full extent 
of ORM schemas, then we would suggest that you try out 
[NORMA](https://marketplace.visualstudio.com/items?itemName=ORMSolutions.NORMA2019) 
in Visual Studio (now on the marketplace of extensions!). However, our extension 
focuses on the interaction side of making the schema rather than the wonderful 
formal components, like fact verbalisation, available in NORMA.

![image](/extension/extension-assets/entities-and-values.png)

## Features

At this stage, we support the following components of the ORM language:
- Entities
    - Referenced or unit-based referenced
    - subtyping for entities
- Value Entities
    - with a single name
- Subtyped Entities
    - a connection can be added to denote that one entity is an instance of another
- Facts
    - of any desired arity
    - uniqueness constraints over roles
    - derivation labels
    - objectification of fact
- Connections 
    - connections between facts and entities
        - these connections can denote that the relationship is mandatory
    - waypoints can be used to modify the connection
- Constraints
    - Value constraints can be applied to entities and roles of facts.

For instance, you can see the graphical representation of these elements in the following snippet:

![image](/extension/extension-assets/medals-example.png)

## Requirements

The editor does not require installing any third library software packages. The extension has been built to run within vs-code as-is. We have developed the extension using a combination of javascript and typescript, for better or worse.

## Extension Settings

We currently expose a set of settings for debugging purposes to the user. 
These settings only affect the visuals of the rendered diagram. For more
information see [settings](/extension/settings.md).

## Release Notes

The following section capture the most recent releases.

### 0.1.8

Value Constraints for entities and roles of facts can now be specified. 
Role objectification has also been improved.
Extension settings can be used to trigger debugging rendering.
Added help system to describe the desired interaction for complex construction.

### 0.1.4

Several bugfixes have been completed for interactions with the ORM schema.
Also, a keyboard shortcut menu has been added, toggle the menu with ctrl+k or via the right-hand palette.
The package now contributes two commands to open a new ORM schema file.
Some general improvements to how connections between elements are handled
have been implemented (mostly visual).

### 0.1.0

Initial release of the ORM editor for testing purposes.
