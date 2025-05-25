# Dragging Module

I had to repackage the `dragging` module from 
[diagram-js](https://github.com/bpmn-io/diagram-js/blob/develop/lib/features/dragging/Dragging.js) 
as an event was not being propagated along the event bus for dragging 
instances.

## Changes

The repacking was required as the dragging module is not really extenable
in a useful manner. For the most part, the module is inlined within a single
function making it difficult to change a single part of the initialisation.

### 1: prefix.out not firing

To resolve the issue, I changed that the dragging module enlists an event
listener with higher priority than the default priority.

Old:
```javascript
// this emit would not be triggered due to some other
// listener blocking propagation
eventBus.on('element.out', out);
```
New:
```javascript
// higher priority means that we are trigger before
// others and are not blocked via propagation
eventBus.on('element.out', 2500, out);
```

