import {
    assign
} from 'min-dash';

import  {
  isLabel, isConnection
} from "diagram-js/lib/util/ModelUtil";
import { isEntity, isFact, isExactlyEntity, isExactlyValue, isUnitReference} from '../model/util';
import { transformToViewbox } from "../utils/canvasUtils";
import EventBus from 'diagram-js/lib/core/EventBus';
import Canvas from 'diagram-js/lib/core/Canvas';


// helpers //////////

function getLabel(element ,context){
  if (context.touchingMode === 'name'){
    return element.name;
  } else if (context.touchingMode === 'ref'){
    return element.ref;
  } else if (context.touchingMode === 'label'){
    if (element.labels){
      if (element.labels.length){
          return element.labels[0].content;
      }
    }
  } else if (context.touchingMode === 'meta'){
    return element.meta;
  } else if (context.touchingMode === 'derived'){
    let derived = element.labels.filter(label => label.derived);
    if (derived.length > 0){
      return derived[0].content;
    } else {
      return "";
    }
  } else if (context.touchingMode === 'objectified'){
    if (element.objectifiedName){
      return element.objectifiedName;
    } else {
      return "";
    }
  }
  return "";
}
  
var HIGH_PRIORITY = 2500;

/**
 * 
 * @param {EventBus} eventBus 
 * @param {../elements/factory} factory 
 * @param {Canvas} canvas 
 * @param {directEditing} directEditing 
 * @param {../modeling/modeler} modeling 
 * @param {*} textRenderer 
 */
export default function LabelEditingProvider(
      eventBus, factory, canvas, directEditing,
      modeling, textRenderer, selection) {
  
    this._factory = factory;
    this._canvas = canvas;
    this._modeling = modeling;
    this._textRenderer = textRenderer;
    this._directEditing = directEditing;  
    this._bus = eventBus;
    this._selection = selection;
  

    this._context = {
      touchingType: null,
      touchingMode: null,
    };

    directEditing.registerProvider(this);
    var that = this;
  
    // listen to dblclick on non-root elements
    eventBus.on(
      ['element.dblclick', 'label.edit.trigger'], HIGH_PRIORITY, function(event) {
      if (isFact(event.element) || isEntity(event.element) || isLabel(event.element)){
        activateDirectEdit(event.element, true);
      }
    });
  
    eventBus.on([
      'shape.remove',
      'connection.remove',
      'canvas.focus.changed',
      'document.loaded'
    ], HIGH_PRIORITY, function(event) {
  
      if (directEditing.isActive(event.element)) {
        directEditing.cancel();
        that._context.touchingType = null;
        that._context.touchingMode = null;
      }
    });
  
    eventBus.on('shape.created', HIGH_PRIORITY, function(event) {
  
      var element = event.shape;
      setTimeout( () => activateDirectEdit(element), 25);
    });
  
    eventBus.on('autoPlace.end', HIGH_PRIORITY, function(event) {
      setTimeout( () => activateDirectEdit(event.shape), 25);
    });
  
  
    function activateDirectEdit(element, force) {
      if (isFact(element)){
        that._context.touchingType = 'fact';
        that._context.touchingMode = 'label';
      } else if (isExactlyEntity(element)){
        that._context.touchingType = 'entity';
        that._context.touchingMode = 'name';
      } else if (isExactlyValue(element)){
        that._context.touchingType = 'value';
        that._context.touchingMode = 'name';
      } else {
        that._context.touchingType = null;
        that._context.touchingMode = null;
        return;
      }
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
    'textRenderer',
    'selection'
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
    var text = getLabel(element, this._context);
  
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
  
    var target = element;
  
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

    var defaultStyle = this._textRenderer.getDefaultStyle();
  
    // take zoom into account
    var defaultFontSize = Math.floor(Math.max(
        24, defaultStyle.fontSize / (vbox.scale/2))) + 'px',
        defaultLineHeight = defaultStyle.lineHeight;
  
    var style = Object.assign({},defaultStyle);
    style['fontSize'] = defaultFontSize;
    return { bounds: bounds, style: style };
  };
  
  
  LabelEditingProvider.prototype.update = function(
      element, newLabel,
      activeContextText, bounds) {
    
    // handle the current label and updating the element
    if (this._context.touchingType === 'entity'){
      this.handleFinishingEntity(element, this._context, newLabel);
    } else if (this._context.touchingType === 'fact'){
      this.handleFinishingFact(element, this._context, newLabel);
    } else if (this._context.touchingMode === 'name'){
      element.name = newLabel;
    }

    // trigger changes
    setTimeout(() => {
      this._modeling.sendUpdates(element, ...element.labels);
      this._selection.select(element);
    }, 25);
   
  };

  LabelEditingProvider.prototype.handleFinishingEntity = function(entity, context, label){
    if (context.touchingMode === 'name'){
      entity.name = label;
      if (context.touchingType === 'entity'){
        this._context.touchingMode = 'ref';
        setTimeout(() => this._directEditing.activate(entity), 5 );
      }
    } else if (this._context.touchingMode === 'ref'){
      entity.ref = label;
      if (isUnitReference(entity)){
        this._context.touchingMode = 'meta';
        setTimeout(() => this._directEditing.activate(entity), 5 );
      }
    } else if (this._context.touchingMode === 'meta'){
      entity.meta = label;
    }
  };

  LabelEditingProvider.prototype.handleFinishingFact = function(fact, context, label){
    if (context.touchingMode === 'label'){
      if (fact.labels && fact.labels.length > 0){
        let factLabel = fact.labels.filter(label => label.factLabel);
        if (factLabel.length > 0){
          factLabel[0].content = label;
        } else {
          this._modeling.createLabelForFact(
            fact,
            label
          );
        }
      } else {
        this._modeling.createLabelForFact(
          fact,
          label
        );
      }
      if (fact.derived){
        this._context.touchingMode = 'derived';
        setTimeout(() => this._directEditing.activate(fact), 5 );
      } else if (fact.objectified){
        this._context.touchingMode = 'objectified';
        setTimeout(() => this._directEditing.activate(fact), 5 );
      }
    } else if (context.touchingMode === 'derived'){
      let derived = fact.labels.filter(label => label.derived);
      if (derived.length > 0){
        let derivedLabel = derived[0];
        derivedLabel.content = label;
      } else {
        this._modeling.makeDerivedLabel(
          fact,
          label
        );
      }
      if (fact.objectified){
        this._context.touchingMode = 'objectified';
        setTimeout(() => this._directEditing.activate(fact), 5 );
      } 
    } else if (context.touchingMode === 'objectified'){
      fact.objectifiedName = label;
    }
  };