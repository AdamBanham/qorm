import {
  forEach
} from 'min-dash';

import SpaceToolHandler from 'diagram-js/lib/features/modeling/cmd/SpaceToolHandler';

export default class SpaceToolHandler2 extends SpaceToolHandler {
    
    static $inject = ['modeling'];
    
    constructor(modeling) {
        super(modeling);
        this.modeling = modeling;
    }

    preExecute(context) {
        var delta = context.delta,
        direction = context.direction,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes,
        start = context.start,
        oldBounds = {};
        
        // (1) move shapes
        this.moveShapes(movingShapes, delta);
        
        // (2a) save old bounds of resized shapes
        forEach(resizingShapes, function(shape) {
            oldBounds[shape.id] = getBounds(shape);
        });
        
        // (2b) resize shapes
        this.resizeShapes(resizingShapes, delta, direction);
        
        // (3) update connection waypoints
        this.updateConnectionWaypoints(
            getWaypointsUpdatingConnections(movingShapes, resizingShapes),
            delta,
            direction,
            start,
            movingShapes,
            resizingShapes,
            oldBounds
        );
    }
}

// helpers //////////

function getBounds(shape) {
    return {
        x: shape.x,
        y: shape.y,
        height: shape.height,
        width: shape.width
    };
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}

function getWaypointsUpdatingConnections(movingShapes, resizingShapes) {
    var waypointsUpdatingConnections = [];

    forEach(movingShapes.concat(resizingShapes), function(shape) {
        var incoming = shape.incoming || [],
            outgoing = shape.outgoing || [];

        forEach(incoming.concat(outgoing), function(connection) {
        var source = connection.source,
            target = connection.target;

        if (includes(movingShapes, source) ||
            includes(movingShapes, target) ||
            includes(resizingShapes, source) ||
            includes(resizingShapes, target)) {

            if (!includes(waypointsUpdatingConnections, connection)) {
            waypointsUpdatingConnections.push(connection);
            }
        }
        });
    });

    return waypointsUpdatingConnections;
}