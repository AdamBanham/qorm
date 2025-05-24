
import {
    getMid
} from 'diagram-js/lib/layout/LayoutUtil';
  
import {
  isNil,
  isObject
} from 'min-dash';

import { isEntity } from '../model/util';

const MARKER_OK = 'connect-ok',
      MARKER_NOT_OK = 'connect-not-ok';

export const EMIT_NAME = "subtyping";

export default function OrmSubtyping(
    eventBus, dragging, modeling, rules, canvas) {

    // rules
  
    function canConnect(source, target) {
      return rules.allowed('subtype.create', {
        source: source,
        target: target,
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
      recuriseRemoveMarkers(start);
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
    eventBus.on(`${EMIT_NAME}.move`, function(event) {
      var context = event.context,
          start = context.start,
          hover = context.hover;
      // check that hovered is a entity, otherwise cancel
      if (!hover || !isEntity(hover)) {
        context.canExecute = false;
        updateMarkers(context.start, context.canExecute);
        updateMarkers(context.hover, context.canExecute);
        return;
      }
      // check if the targeted entity is subtypable.
      var canExecute = context.canExecute = canConnect(
        start, hover
      );
      
      // reset markers on mouse
      updateMarkers(context.start, context.canExecute);
      updateMarkers(context.hover, context.canExecute);
      if (canExecute) {
        context.source = start;
        context.target = hover;
      }
    });
  
    eventBus.on(`${EMIT_NAME}.hover`, function(event) {
      var context = event.context,
          start = context.start,
          hover = event.hover,
          canExecute;

      // check that hover is an entity, otherwise cancel
      if (!hover || !isEntity(hover)) {
        context.canExecute = false;
        updateMarkers(start, context.canExecute);
        updateMarkers(hover, context.canExecute);
        return;
      }
  
      // cache hover state
      context.hover = hover;
      canExecute = context.canExecute = 
        canConnect(start, hover);
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
  
    eventBus.on([ `${EMIT_NAME}.out`, `${EMIT_NAME}.cleanup` ], function(event) {
      var context = event.context;
      recuriseRemoveMarkers(context.hover);
      recuriseRemoveMarkers(context.start);
      context.hover = null;
      context.source = null;
      context.target = null;
      context.canExecute = false;
    });

    eventBus.on([`${EMIT_NAME}.cancel`,`${EMIT_NAME}.canceled`], function(event) {
      var context = event.context;
      recuriseRemoveMarkers(context.hover);
      recuriseRemoveMarkers(context.start);
    });
  
    eventBus.on(`${EMIT_NAME}.end`, function(event) {
      var context = event.context,
          canExecute = context.canExecute,
          src = context.source,
          tgt = context.target;
      // clear markers
      recuriseRemoveMarkers(src);
      recuriseRemoveMarkers(tgt);
      if (!canExecute) {
        return;
      }
      if (canConnect(src, tgt)){
        let con = modeling.createSubtypeBetween(src, tgt);
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
      
      dragging.init(event, `${EMIT_NAME}`, {
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
  
  OrmSubtyping.$inject = [
    'eventBus',
    'dragging',
    'modeling',
    'rules',
    'canvas'
  ];