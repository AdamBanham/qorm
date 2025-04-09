
import {
    getMid
} from 'diagram-js/lib/layout/LayoutUtil';
  
import {
  isNil,
  isObject
} from 'min-dash';

import { isFact } from '../model/util';
import { transformToViewbox } from "../utils/canvasUtils";

var MARKER_OK = 'connect-ok',
MARKER_NOT_OK = 'connect-not-ok';

export default function OrmConnect(
    eventBus, dragging, modeling, rules, canvas) {

    // rules
  
    function canConnect(source, target, role) {
      return rules.allowed('connection.create', {
        source: source,
        target: target,
        role: role
      });
    }

    function removeMarkers(element) {
      if (!element) {
        return;
      }
      canvas.removeMarker(element, MARKER_OK);
      canvas.removeMarker(element, MARKER_NOT_OK);
    }

    function updateMarkers(start, canExecute) {
      if (!start) {
        return;
      }
      removeMarkers(start);
      if (canExecute) {
        canvas.addMarker(start, MARKER_OK);
      } else {
        canvas.addMarker(start, MARKER_NOT_OK);
      }
    }

    function hasMarkers(element){
      if (!element) {
        return false;
      }
      return canvas.hasMarker(element, MARKER_OK) ||
        canvas.hasMarker(element, MARKER_NOT_OK);
    }

    function recuriseRemoveMarkers(element) {
      if (!element) {
        return;
      }
      while (hasMarkers(element)) {
        removeMarkers(element);
        element = element.parent;
        if (!element) {
          break;
        }
      }
    }
  
    // event handlers
    eventBus.on('connect.move', function(event) {
      var context = event.context,
          start = context.start,
          hover = context.hover;
      // check for fact, otherwise cancel
      if (!hover || !isFact(hover)) {
        context.canExecute = false;
        updateMarkers(context.start, context.canExecute);
        updateMarkers(context.hover, context.canExecute);
        return;
      }
      // check if the targeted role is available after transforming.
      let transform = transformToViewbox(
        canvas.viewbox(), 
        { x : event.originalEvent.layerX, 
          y: event.originalEvent.layerY
        }
      );
      context.targetRole = hover.findNearestRoleUsingPosX(transform.x);
      var canExecute = context.canExecute = canConnect(
        start, hover, context.targetRole
      );
      
      // reset markers on mouse
      updateMarkers(context.start, context.canExecute);
      updateMarkers(context.hover, context.canExecute);
      if (canExecute) {
        context.source = start;
        context.target = hover;
      }
    });
  
    eventBus.on('connect.hover', function(event) {
      var context = event.context,
          start = context.start,
          hover = event.hover,
          canExecute;

      // check for fact, otherwise cancel
      if (!hover || !isFact(hover)) {
        context.canExecute = false;
        updateMarkers(start, context.canExecute);
        updateMarkers(hover, context.canExecute);
        return;
      }
  
      // cache hover state
      context.hover = hover;
      var targetedRole = context.targetRole;
      if (hover){
        // check if the targeted role is available after transforming.
        let transform = transformToViewbox(
          canvas.viewbox(),
          { x : event.originalEvent.layerX, 
            y: event.originalEvent.layerY
          }
        );
        context.targetRole = targetedRole = 
          hover.findNearestRoleUsingPosX(transform.x);
      }
      canExecute = context.canExecute = 
        canConnect(start, hover, targetedRole);
      updateMarkers(start, context.canExecute);
      updateMarkers(hover, context.canExecute);
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
      recuriseRemoveMarkers(context.hover);
      recuriseRemoveMarkers(context.start);
      context.hover = null;
      context.source = null;
      context.target = null;
      context.targetRole = null;
      context.canExecute = false;
    });

    eventBus.on(['connect.cancel','connect.canceled'], function(event) {
      var context = event.context;
      recuriseRemoveMarkers(context.hover);
      recuriseRemoveMarkers(context.start);
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
      recuriseRemoveMarkers(entity);
      recuriseRemoveMarkers(fact);
      if (!canExecute) {
        return;
      }
      if (canConnect(entity, fact, role)){
        let con = modeling.connectToFact(fact, entity, role);
        recuriseRemoveMarkers(con);
      } 
    });

    
  
  
    // API
  
    /**
     * Start connect operation.
     *
     * @param {MouseEvent|TouchEvent} event
     * @param {Element} start
     * @param {*} [connectionStart]
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