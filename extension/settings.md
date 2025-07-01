# Exposed Extension Settings

This readme outlines the settings exposed by the extension. These settings
can be set via the user preferences within vscode 
(`Preferences: Open User Settings`) under `qorma` in extensions.


## Debug

There are several setting that affect the rendering process within the 
editor. To turn on these settings, `debugRendering` must be set to true.
Currently the following types of debugging rendering can be set through
the extension settings:

- The opacity of shapes; 
- and center debug dots.

For each of these settings there is a global setting that applies to all 
shapes, and a further setting targetting a type of shape.

The json shape of these settings is as follows:
```json
{
    debugRendering: false,
    renderingOptions: {
        opacity: {
            shape: 1,
            others: {
                fact: 1,
                entity: 1,
                label: 1,
                objectification: 1,
                uniquenessConstraint: 1,
                valueConstraint: 1
            }
        },
        debugDot: {
            shape: false,
            others: {
                fact: false,
                entity: false,
                label: false,
                objectification: false,
                uniquenessConstraint: false,
                valueConstraint: false
            }
        }
    }
}
```