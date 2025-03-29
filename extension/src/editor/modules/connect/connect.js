
import { isFact } from '../model/util';
import {
  set as cursorSet,
} from 'diagram-js/lib/util/Cursor';

import {
    getMid
  } from 'diagram-js/lib/layout/LayoutUtil';
  
  import {
    isNil,
    isObject
  } from 'min-dash';

  var MARKER_OK = 'connect-ok',
  MARKER_NOT_OK = 'connect-not-ok';

export default function OrmConnect(eventBus, dragging, modeling, rules, canvas) {

    // rules
  
    function canConnect(source, target, role) {
      return rules.allowed('connection.create', {
        source: source,
        target: target,
        role: role
      });
    }
  
  
    // event handlers
    eventBus.on('connect.move', function(event) {
      var context = event.context,
          start = context.start,
          hover = context.hover;
      // check for fact, otherwise cancel
      if (!hover || !isFact(hover)) {
        canvas.removeMarker(start, MARKER_OK);
        canvas.removeMarker(start, MARKER_NOT_OK);
        canvas.addMarker(start, MARKER_NOT_OK);
        return;
      }
      // check if the targeted role is available.
      console.log("connect.move :: ", event.originalEvent);
      context.targetRole = hover.findNearestRoleUsingPosX(event.originalEvent.layerX);
      var targetedRole = context.targetRole;
      var canExecute = context.canExecute = canConnect(start, hover, targetedRole);
      // reset markers on mouse
      canvas.removeMarker(hover, MARKER_OK);
      canvas.removeMarker(hover, MARKER_NOT_OK);
      // adjust
      canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
      if (canExecute) {
        context.source = start;
        context.target = hover;
      }
      return;
    });
  
    eventBus.on('connect.hover', function(event) {
      var context = event.context,
          start = context.start,
          hover = event.hover,
          canExecute;

      // check for fact, otherwise cancel
      if (!hover || !isFact(hover)) {
        return;
      }
  
      // cache hover state
      context.hover = hover;
      var targetedRole = context.targetRole;
      if (hover){
        context.targetRole = targetedRole = 
          hover.findNearestRoleUsingPosX(event.originalEvent.layerX);
      }
      canExecute = context.canExecute = 
        canConnect(start, hover, targetedRole);
  
      // ignore hover
      if (isNil(canExecute)) {
        return;
      }
  
      if (canExecute !== false) {
        context.source = start;
        context.target = hover;
      } 
      return;
    });
  
    eventBus.on([ 'connect.out', 'connect.cleanup' ], function(event) {
      var context = event.context;
      context.hover = null;
      context.target = null;
      context.targetRole = null;
      context.canExecute = false;
    });
  
    eventBus.on('connect.end', function(event) {
      var context = event.context,
          canExecute = context.canExecute,
          connectionStart = context.connectionStart,
          connectionEnd = {
            x: event.x,
            y: event.y
          },
          entity = context.source,
          role = context.targetRole,
          fact = context.target;

      // clear markers
      if (context.start !== null) {
        let start = context.start;
        canvas.removeMarker(start, MARKER_OK);
        canvas.removeMarker(start, MARKER_NOT_OK);
      }
      if (context.hover !== null) {
        let hover = context.hover;
        canvas.removeMarker(hover, MARKER_OK);
        canvas.removeMarker(hover, MARKER_NOT_OK);
      }
  
      if (!canExecute) {
        return false;
      }

      if (canConnect(entity, fact, role)){
        console.log("connect.end::", entity, fact, role);
        let connection = modeling.connectToFact(fact, entity, role);
        modeling.moveElements([connection,fact,entity], { x: 0, y: 0. });
      }
    });

    
  
  
    // API
  
    /**
     * Start connect operation.
     *
     * @param {MouseEvent|TouchEvent} event
     * @param {Element} start
     * @param {Point} [connectionStart]
     * @param {boolean} [autoActivate=false]
     */
    this.start = function(event, start, connectionStart, autoActivate) {
      if (!isObject(connectionStart)) {
        autoActivate = connectionStart;
        connectionStart = getMid(start);
      }
  
      dragging.init(event, 'connect', {
        autoActivate: autoActivate,
        data: {
          shape: start,
          context: {
            start: start,
            connectionStart: connectionStart
          }
        }
      });
    };
  }
  
  OrmConnect.$inject = [
    'eventBus',
    'dragging',
    'modeling',
    'rules',
    'canvas'
  ];
  
  
  // helpers //////////
  
  export function isReverse(context) {
    var hover = context.hover,
        source = context.source,
        target = context.target;
  
    return hover && source && hover === source && source !== target;
  }