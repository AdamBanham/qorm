# Qwerty Object-Role-Modelling (ORM) Architect

This is a vs-studio-code extension that supports rich interactions for
constructing an ORM schema within the editor.
The features of the editor are futher explained in the extension's 
[readme](./extension/README.md).

At a high level, the extension allows for the construction of ORM schemas 
and exporting them into a svg. The following schema is constructed to very
roughly capture how might a travel agency might handle their application data
for a website.
![travel_agency_orm](./sampleFiles/travel_agency.svg)

The underlying file structure used to store the schema 
is currently written within yaml. You can check out the file structure for
the above schema [here](./sampleFiles/travel_agency.orm).

## Building the extension

To prepare the extension for the marketplace or for personal installment,
make sure to have the [vsce](https://github.com/microsoft/vscode-vsce) or 
"Visual Studio Code Extensions" CLI installed.

### Preparing and Packaging

Using vsce, the extension can be packaged via the following commands
```bash
cd extension
vsce package
```
Note that the version of the extension is controlled by the `version` 
attribute in [package.json](./extension/package.json).

After package is completed, a new vsix file will be generated. This file
can be shared for personal installs of the extension without the marketplace
approval.

### Publishing

Using vsce, the extension can be published via the following command:
```bash
vsce publish
```

Note that publishing to marketplace requires a PAT for the marketplace 
version of the extension to be pushed.

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
