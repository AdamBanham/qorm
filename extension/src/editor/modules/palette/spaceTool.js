
import {
  forEach
} from 'min-dash';

import {
  isConnection,
  isLabel
} from 'diagram-js/lib/util/ModelUtil';


var AXIS_TO_DIMENSION = {
  x: 'width',
  y: 'height'
};

import SpaceTool from "diagram-js/lib/features/space-tool/SpaceTool";
import { isObjectification } from '../model/util';

export default class OrmSpaceTool extends SpaceTool {

    constructor(canvas, dragging, eventBus,
        modeling, rules, toolManager,
        mouse) {
        super(canvas, dragging, eventBus,
            modeling, rules, toolManager,
            mouse
        );
    }

    makeSpace(movingShapes, resizingShapes, delta, direction, start) {
        super.makeSpace(movingShapes, resizingShapes, delta, direction, start);
    }

    calculateAdjustments(elements, axis, delta, start) {
        let ret = this._cal(elements, axis, delta, start);
        return ret;
    }

    _cal(elements, axis, delta, start) {
        var rules = this._rules;

        var movingShapes = [],
            resizingShapes = [];

        var attachers = [],
            connections = [];

        function moveShape(shape) {
            if (!movingShapes.includes(shape)) {
                movingShapes.push(shape);
            }

            if (shape.labels && shape.labels.length > 0) {
                for( let label of shape.labels) {
                    // move external label if its label target is moving
                    if (label && !movingShapes.includes(label)) {
                        movingShapes.push(label);
                    }
                }
            }
        }

        function resizeShape(shape) {
            if (!resizingShapes.includes(shape)) {
                resizingShapes.push(shape);
            }
        }

        forEach(elements, function(element) {
            if (!element.parent || isLabel(element) || isObjectification(element)) {
                return;
            }

            // handle connections separately
            if (isConnection(element)) {
                connections.push(element);

                return;
            }

            var shapeStart = element[ axis ],
                shapeEnd = shapeStart + element[ AXIS_TO_DIMENSION[ axis ] ];

            // handle attachers separately
            if (isAttacher(element)
                && ((delta > 0 && getMid(element)[ axis ] > start)
                    || (delta < 0 && getMid(element)[ axis ] < start))) {
                attachers.push(element);

                return;
            }

            // move shape if its start is after space tool
            if ((delta > 0 && shapeStart > start)
                || (delta < 0 && shapeEnd < start)) {
                    moveShape(element);

                    return;
            }

            // resize shape if it's resizable and its start is before and its end is after space tool
            if (shapeStart < start
                && shapeEnd > start
                && rules.allowed('shape.resize', { shape: element })
                ) {
                resizeShape(element);

                return;
            }
        });

        // move attacher if its host is moving
        forEach(movingShapes, function(shape) {
            var attachers = shape.attachers;

            if (attachers) {
                forEach(attachers, function(attacher) {
                    moveShape(attacher);
                });
            }
        });

        var allShapes = movingShapes.concat(resizingShapes);

        // move attacher if its mid is after space tool and its host is moving or resizing
        forEach(attachers, function(attacher) {
            var host = attacher.host;

            if (includes(allShapes, host)) {
                moveShape(attacher);
            }
        });

        allShapes = movingShapes.concat(resizingShapes);

        // move external label if its label target's (connection) source and target are moving
        forEach(connections, function(connection) {
            var source = connection.source,
                target = connection.target,
                label = connection.label;

            if (includes(allShapes, source)
                && includes(allShapes, target)
                && label) {
                    moveShape(label);
            }
        });

        return {
            movingShapes: movingShapes,
            resizingShapes: resizingShapes
        };
    }
}

OrmSpaceTool.$inject = [
  'canvas',
  'dragging',
  'eventBus',
  'modeling',
  'rules',
  'toolManager',
  'mouse'
];

// helpers 
function includes(array, item) {
  return array.indexOf(item) !== -1;
}

function isAttacher(element) {
  return !!element.host;
}