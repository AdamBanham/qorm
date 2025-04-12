import Keyboard from "diagram-js/lib/features/keyboard/keyboard";
import Canvas from "diagram-js/lib/core/Canvas";
import {
    isCmd,
    isKey,
} from 'diagram-js/lib/features/keyboard/KeyboardUtil';
import { isConnection } from "diagram-js/lib/util/ModelUtil";
import EventBus from "diagram-js/lib/core/EventBus";

import { isFact, isEntity, isExactlyEntity } from "../model/util";
import Modeling from "../modeling/modeler";

const ZoomPunch = 0.25;

/**
 * Service binding for keyboard controls for interacting
 * with editor.
 */
export default class OrmShortcuts {

    /**
     * @param {EventBus} eventbus
     * @param {Keyboard} keyboard 
     * @param {*} selection 
     * @param {*} elementFactory
     * @param {Modeling} modeling
     * @param {Canvas} canvas
     * @param {*} mouse
     * @param {*} create
     */
    constructor(eventbus, keyboard, selection, elementFactory, modeling, canvas, mouse, create, connect){
        this._selection = selection;
        this._modeling = modeling;
        this._canvas = canvas;
        this._eventbus = eventbus;
        this._create = create;
        this._factory = elementFactory;
        this._mouse = mouse;
        this._connect = connect;
        var that = this;

        keyboard.addListener((context) =>{
            that.triggerDelete(that, context);
        });
        keyboard.addListener((context) =>{
            that.triggerZoomIn(that, context);
        });
        keyboard.addListener((context) =>{
            that.triggerZoomOut(that, context);
        });
        keyboard.addListener((context) =>{
            that.triggerLabelEdit(that, context);
        });
        keyboard.addListener((context) =>{
            that.triggerCreate(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerFactGrowth(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerSimpleConstraint(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerMandatory(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerSwapEntityType(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerConnectTo(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerReferenceFlip(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerObjectifcation(that, context);
        });
    }

    /**
     * Will delete the current selection on the following keydowns:
     * 'delete'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerDelete(that, context){
        const event = context.keyEvent;
        if (isKey([ 'Delete', 'Del', ], event)){
            that._modeling.removeElements(that._selection.get());
        }
    }

    /**
     * Will zoom in the canvas on the following keydowns:
     * 'crtl + (+)'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerZoomIn(that, context){
        const event  = context.keyEvent;
        if (event.ctrlKey){
            if (isKey(['+', '=', 'Plus', 'Equal'], event)){
                const view = that._canvas.viewbox();
                let scale = view.scale + 0.25;
                that._canvas.zoom(scale);
                event.stopPropagation();
            }
        }
    }

    /**
     * Will zoom out the canvas on the following keydowns:
     * 'crtl + -'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerZoomOut(that, context){
        const event  = context.keyEvent;
        if (event.ctrlKey){
            if (isKey(['-', '_', 'Minus'], event)){
                const view = that._canvas.viewbox();
                let scale = view.scale - ZoomPunch;
                that._canvas.zoom(scale);
                event.stopPropagation();
            }
        }
    }

    /**
     * Will trigger label editing on the following keydowns:
     * 'enter'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
     triggerLabelEdit(that, context){
        const event  = context.keyEvent;
        if (isKey(['Enter'], event)){
            const selected = that._selection.get();
            if (selected.length === 1){
                const select = selected[0];
                that._eventbus.fire('label.edit.trigger', {
                    element : select
                });
                event.stopPropagation();
            }
        }
    }

    /**
     * Will trigger the creation of an element on the following keydowns:
     * 'alt + e' (entity), 'alt + v' (value), 'alt + f' (fact)
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerCreate(that, context,){
        const event  = context.keyEvent;
        if (event.altKey){
            if (isKey(['e'], event)){
                event.stopPropagation();
                var s = Object.assign(
                    that._factory.createDummyAttributesForEntities('entity'),
                    {x: 0, y:0}
                );

                that._create.start(that._mouse.getLastMoveEvent (), s);
            }
            if (isKey(['v'], event)){
                event.stopPropagation();
                var s = Object.assign(
                    that._factory.createDummyAttributesForEntities('value'),
                    {x: 0, y:0}
                );
      
                that._create.start(that._mouse.getLastMoveEvent (), s);
            }
            if (isKey(['f'], event)){
                event.stopPropagation();
                var s = Object.assign(
                    that._factory.createDummyAttributesForFacts(),
                    {x: 0, y:0}
                );
      
                that._create.start(that._mouse.getLastMoveEvent (), s);
            }
        }
    }

    /**
     * Will trigger fact expansion or reduction the following keydowns:
     * '+' (expand), '-' (reduce)
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerFactGrowth(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select)){
                if (isKey(['Plus', 'Equal', '+', '='], event)){
                    event.stopPropagation();
                    that._modeling.expandFact(select);
                }
                else if (isKey(['Minus', '-'], event)){
                   event.stopPropagation(); 
                   if (select.roles > 1){
                        that._modeling.reduceFact(select);
                   }
                }
            }
        }
    }

    /**
     * Will trigger fact expansion or reduction the following keydowns:
     * '+' (expand), '-' (reduce)
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerSimpleConstraint(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select)){
                if (isKey(['c', 'C'], event)){
                    event.stopPropagation();
                    that._eventbus.fire('fact.create.constraint', 
                        {fact: select, mode: 'simple', originalEvent: event}
                    );
                }
            }
        }
    }

    /**
     * Will flip mandatory on connections on the following keydowns:
     * 'm'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerMandatory(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isConnection(select)){
                if (isKey(['m', 'M'], event)){
                    event.stopPropagation();
                    that._modeling.flipMandatoryConstraint(select);
                }
            }
        }
    }

    /**
     * Will flip the type of an entity on the following keydowns:
     * 's'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerSwapEntityType(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isEntity(select)){
                if (isKey(['s', 'S'], event)){
                    event.stopPropagation();
                    that._modeling.flipEntityType(select);
                }
            }
        }
    }

    /**
     * Will trigger a connecting an entity with a fact on the following keydowns:
     * 'c'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerConnectTo(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            let select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isEntity(select)){
                if (isKey(['c', 'C'], event)){
                    const other = that._mouse.getLastMoveEvent();
                    that._connect.start(other, select, true);
                    event.stopPropagation();
                }
            }
        }
    }

    /**
     * flips the label reference mode.
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerReferenceFlip(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isExactlyEntity(select)){
                if (isKey(['r', 'R'], event)){
                    event.stopPropagation();
                    that._modeling.flipLabelReference(select);
                }
            }
        }
    }

    /**
     * flips the objecfication of a selected fact.
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerObjectifcation(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select)){
                if (isKey(['o', 'O'], event)){
                    event.stopPropagation();
                    that._modeling.flipObjectification(select);
                }
            }
        }
    }

    
    

}

OrmShortcuts.$inject = [
    'eventBus',
    'keyboard',
    'selection',
    'elementFactory',
    'modeling',
    'canvas',
    'mouse',
    'create',
    'ormConnect'
];