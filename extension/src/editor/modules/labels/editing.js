import {
    assign
} from 'min-dash';

import {
  getConnectionMid
} from "diagram-js/lib/layout/LayoutUtil";

import  {
  isLabel, isConnection
} from "diagram-js/lib/util/ModelUtil";
import { isFact } from '../model/util';
import { transformToViewbox } from "../utils/canvasUtils";

// helpers //////////

function getLabel(element){
  if (element.labels){
    if (element.labels.length){
        return element.labels[0].content;
    }
    }
  return "";
}
  
var HIGH_PRIORITY = 2000;
  
export default function LabelEditingProvider(
      eventBus, factory, canvas, directEditing,
      modeling, textRenderer) {
  
    this._factory = factory;
    this._canvas = canvas;
    this._modeling = modeling;
    this._textRenderer = textRenderer;
    this._bus = eventBus;
  
    directEditing.registerProvider(this);
  
    // listen to dblclick on non-root elements
    eventBus.on('element.dblclick', function(event) {
      activateDirectEdit(event.element, true);
    });
  
    // complete on followup canvas operation
    eventBus.on([
      'autoPlace.start',
      'canvas.viewbox.changing',
      'drag.init',
      'element.mousedown',
      'popupMenu.open',
      'root.set',
      'selection.changed'
    ], function() {
      if (directEditing.isActive()) {
        directEditing.complete();
      }
    });
  
    eventBus.on([
      'shape.remove',
      'connection.remove'
    ], HIGH_PRIORITY, function(event) {
  
      if (directEditing.isActive(event.element)) {
        directEditing.cancel();
      }
    });
  
    // cancel on command stack changes
    eventBus.on([ 'commandStack.changed' ], function(e) {
      if (directEditing.isActive()) {
        directEditing.cancel();
      }
    });
  
  
    eventBus.on('directEditing.activate', function(event) {
    //   resizeHandles.removeResizers();
    });
  
    eventBus.on('create.end', 500, function(event) {
  
      var context = event.context,
          element = context.shape,
          canExecute = event.context.canExecute,
          isTouch = event.isTouch;
  
      if (isTouch) {
        return;
      }
  
      if (!canExecute) {
        return;
      }
  
      if (context.hints && context.hints.createElementsBehavior === false) {
        return;
      }
  
      activateDirectEdit(element);
    });
  
    eventBus.on('autoPlace.end', 500, function(event) {
      activateDirectEdit(event.shape);
    });
  
  
    function activateDirectEdit(element, force) {
        directEditing.activate(element);
    }
  
  }
  
  LabelEditingProvider.$inject = [
    'eventBus',
    'elementFactory',
    'canvas',
    'directEditing',
    'modeling',
    // 'resizeHandles',
    'textRenderer'
  ];
  
  
  /**
   * Activate direct editing for activities and text annotations.
   *
   * @param {Element} element
   *
   * @return { {
   *   text: string;
   *   options?: {
   *     autoResize?: boolean;
   *     centerVertically?: boolean;
   *     resizable?: boolean;
   *   }
   * } & DirectEditingContext }
   */
  LabelEditingProvider.prototype.activate = function(element) {
  
    // text
    var text = getLabel(element);
  
    if (text === undefined) {
      return;
    }
  
    var context = {
      text: text
    };
  
    // bounds
    var bounds = this.getEditingBBox(element);
  
    assign(context, bounds);
  
    var options = {};
    var style = context.style || {};
  
    // Remove background and border
    assign(style, {
      backgroundColor: "rgba(0,0,0,0.5)",
      padding: '3px',
      'border-radius': '5px',
      color: 'red',
      width: element.width,
      textWrap: 'pretty',
      border: null
    });
  
    assign(context, {
      options: options,
      style: style
    });
  
    return context;
  };
  
  
  /**
   * Get the editing bounding box based on the element's size and position.
   *
   * @param {Element} element
   *
   * @return {DirectEditingContext}
   */
  LabelEditingProvider.prototype.getEditingBBox = function(element) {
    var canvas = this._canvas;
  
    var target = element.label || element;
  
    var bbox = canvas.getAbsoluteBBox(target);
    const vbox = canvas.viewbox();
    const transform = transformToViewbox(
        canvas.viewbox(),
        {
            x: target.x, y: target.y,
        }
    );
    
    var bounds = {
      x: target.x * vbox.scale - vbox.x * vbox.scale,
      y: target.y * vbox.scale - vbox.y * vbox.scale,
      width: target.width * vbox.scale,
      height: target.height * vbox.scale
    };

    console.log("editing :: ", target, bounds);
    var defaultStyle = this._textRenderer.getDefaultStyle();
  
    // take zoom into account
    var defaultFontSize = Math.floor(Math.max(
        24, defaultStyle.fontSize / (vbox.scale/2))) + 'px',
        defaultLineHeight = defaultStyle.lineHeight;
  
    var style = Object.assign({},defaultStyle);
    style['fontSize'] = defaultFontSize;
    console.log("style", style);
    return { bounds: bounds, style: style };
  };
  
  
  LabelEditingProvider.prototype.update = function(
      element, newLabel,
      activeContextText, bounds) {
  
    var newBounds,
        bbox;
  
    // if (isEmptyText(newLabel)) {
    //   newLabel = "";
    //   return
    // }
    // var position;
    // if (isState(element)){
    //   element.stateLabel = newLabel
    //   this._bus.fire('elements.changed', {elements: [element]})
    //   return
    // } else if (isLabel(element)){
    //   element.text = newLabel
    //   element.labelTarget.arcLabel = newLabel
    //   assign(element, this._textRenderer.getTextAnnotationBounds(
    //     element, newLabel
    //   ))
    //   this._bus.fire('elements.changed', 
    //     {elements: [element,element.labelTarget]})
    //   return
    // } else {
    //   element.arcLabel = newLabel
    //   this._bus.fire('elements.changed', {elements: [element]})
    //   position = getConnectionMid(element)
    // }
    // if (!element.label){
    //   var label = this._factory.createLabel({
    //     text: newLabel,
    //     width: 50,
    //     height: 12,
    //     labelTarget: element,
    //     x: 0
    //   })
    //   assign(label, this._textRenderer.getTextAnnotationBounds(
    //     label, newLabel
    //   ))
    //   this._modeling.createLabel(
    //     element,
    //     position,
    //     label,
    //     element
    //   )
    //   this._bus.fire('action.create', {element: label})
    // } else {
    //   element.label.text = newLabel
    //   this._bus.fire('elements.changed', 
    //     {elements: [element, element.label]})
    // }
   
  };