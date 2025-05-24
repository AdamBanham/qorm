# Connect Module

This module handles making connections between elements. For the most part,
is module extends the connect module in [diagram-js](https://github.com/bpmn-io/diagram-js/tree/develop/lib/features/connect).
The module uses the dragging interface to allow for click and dragging 
over other elements to determine if a connection should be made.
A connector `C` exposed in this module can be triggered by calling 
`C.start(event, src)`.

## Connectors

The following connector interfaces are exposed:
- **ormConnect**
    - handles connections between entities and facts.
- **ormSubtyping**
    - handles connections for subtyping between entities.


