import { Connect } from 'diagram-js/lib/features/connect/Connect';
import { isFact } from '../model/util';

import {
    getMid
  } from 'diagram-js/lib/layout/LayoutUtil';
  
  import {
    isNil,
    isObject
  } from 'min-dash';

export default function OrmConnect(eventBus, dragging, modeling, rules) {

    // rules
  
    function canConnect(source, target) {
      return rules.allowed('connection.create', {
        source: source,
        target: target
      });
    }
  
    function canConnectReverse(source, target) {
      return canConnect(target, source);
    }
  
  
    // event handlers
  
    eventBus.on('connect.hover', function(event) {
      var context = event.context,
          start = context.start,
          hover = event.hover,
          canExecute;
  
      // cache hover state
      context.hover = hover;
  
      canExecute = context.canExecute = canConnect(start, hover);
  
      // ignore hover
      if (isNil(canExecute)) {
        return;
      }
  
      if (canExecute !== false) {
        context.source = start;
        context.target = hover;
  
        return;
      }
  
      canExecute = context.canExecute = canConnectReverse(start, hover);
  
      // ignore hover
      if (isNil(canExecute)) {
        return;
      }
  
      if (canExecute !== false) {
        context.source = hover;
        context.target = start;
      }
    });
  
    eventBus.on([ 'connect.out', 'connect.cleanup' ], function(event) {
      var context = event.context;
  
      context.hover = null;
      context.source = null;
      context.target = null;
  
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
          source = context.source,
          target = context.target;
  
      if (!canExecute) {
        return false;
      }

      let fact = null;
      let entity = null;
      if (isFact(source)){
        fact = source;
        entity = target;
      } else {
        fact = target;
        entity = source;
      }
      console.log("using custom connect :: ", fact, entity);
      context.connection = modeling.connectToFact(fact, entity);
      modeling.moveElements([context.connection,fact,entity], { x: 0, y: 0. });
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
    'rules'
  ];
  
  
  // helpers //////////
  
  export function isReverse(context) {
    var hover = context.hover,
        source = context.source,
        target = context.target;
  
    return hover && source && hover === source && source !== target;
  }