import Keyboard from "diagram-js/lib/features/keyboard/keyboard";
import Canvas from "diagram-js/lib/core/Canvas";
import {
    isCmd,
    isKey,
} from 'diagram-js/lib/features/keyboard/KeyboardUtil';
import { isConnection } from "diagram-js/lib/util/ModelUtil";
import EventBus from "diagram-js/lib/core/EventBus";

import { isFact, isEntity, isExactlyEntity, isSubtype, isObjectification, isConstraint } from "../model/util";
import Modeling from "../modeling/modeler";
import { BUS_TRIGGER as CONSTRAINT_BUS_TRIGGER,
         SIMPLE_MODE as CONSTRAINT_SIMPLE_MODE,
         OBJECT_VALUE_MODE as CONSTRAINT_VALUE_MODE,
         ROLE_VALUE_MODE as CONSTRAINT_ROLE_VALUE_MODE,
         ROLE_VALUE_MODE
 } from "../constraints/constraints";
import { isValueConstraint } from "../constraints/model/utils";

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
    constructor(
        eventbus, keyboard, selection, elementFactory, 
        modeling, canvas, mouse, create, 
        connect, subtyping, placement){
        this._selection = selection;
        this._modeling = modeling;
        this._canvas = canvas;
        this._eventbus = eventbus;
        this._create = create;
        this._factory = elementFactory;
        this._mouse = mouse;
        this._connect = connect;
        this._csubtyping = subtyping;
        this._placement = placement;
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
            that.triggerValueConstraint(that, context);
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
        keyboard.addListener((context) => {
            that.triggerDerived(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerTowards(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerSubtypeConnect(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerConnectFactOnEntity(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerKeyboardHelpMenu(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerConstraintIncrease(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerConstraintDecrease(that, context);
        });
        keyboard.addListener((context) => {
            that.triggerAlignmentToggle(that, context);
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
            let selected = that._selection.get();
            for(let select of selected){
                switch (true) {
                    case isValueConstraint(select):
                        that._modeling.removeValueConstraint(select);
                        break;
                    case isConstraint(select):
                        that._modeling.removeConstraint(select);
                        break;
                    case isObjectification(select):
                        that._modeling.flipObjectification(select.fact);
                        break;
                    default:
                        that._modeling.removeElements([select]);
                }
            }
            
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
                event.stopPropagation();
                event.preventDefault();
                const select = selected[0];
                that._eventbus.fire('label.edit.trigger', {
                    element : select
                });
                
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
     * Will trigger adding new a simple constraint on the following keydowns:
     * 'c', 'C'
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
                    that._eventbus.fire(CONSTRAINT_BUS_TRIGGER, 
                        {source: select, mode: CONSTRAINT_SIMPLE_MODE,
                         originalEvent: event}
                    );
                    setTimeout(
                        () => this._selection.deselect(select), 
                    5 );
                }
            }
        }
    }

    /**
     * Will trigger adding a new value constraint on the following keydowns:
     * 'v', 'V'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerValueConstraint(that, context){
        const event  = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select) || isEntity(select)){
                if (isKey(['v', 'v'], event)){
                    if (isEntity(select) && select.hasValueConstraint()){
                        that._modeling.removeAllValueConstraint(select);
                    } else {
                        let mode = isFact(select) ? 
                            ROLE_VALUE_MODE : CONSTRAINT_VALUE_MODE;
                        that._eventbus.fire(CONSTRAINT_BUS_TRIGGER, 
                            {source: select, mode: mode,
                             originalEvent: event}
                        );
                    }
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
     * 't', 'T'
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
                if (isKey(['t', 'T'], event)){
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
            if (isEntity(select) || isObjectification(select)){
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

    /**'
     * flips the derived state on a fact.
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerDerived(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select)){
                if (isKey(['d', 'D'], event)){
                    event.stopPropagation();
                    that._modeling.flipDerivation(select);
                }
            }
        }
    }

    triggerTowards(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isFact(select)){
                if (isKey(['l', 'L'], event)){
                    event.stopPropagation();
                    select.setTowards('left');
                    that._modeling.sendUpdate(select);
                } else if (isKey(['r', 'R'], event)){
                    event.stopPropagation();
                    select.setTowards('right');
                    that._modeling.sendUpdate(select);
                } else if (isKey(['n', 'N'], event)){
                    event.stopPropagation();
                    select.unsetTowards();
                    that._modeling.sendUpdate(select);
                }
            }
        }
    }

    /**
     * Triggers subtyping on a selected entity on the following keydowns:
     * 's', 'S'
     * @param {OrmShortcuts} that 
     * @param {*} context 
     */
    triggerSubtypeConnect(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            let select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isExactlyEntity(select)){
                if (isKey(['s', 'S'], event)){
                    const other = that._mouse.getLastMoveEvent();
                    that._csubtyping.start(other, select);
                }
            }
        }
    }

    triggerConnectFactOnEntity(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            let select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isEntity(select) || isObjectification(select)){
                if (isKey(['f', 'F'], event)){
                    var fact = Object.assign(
                    that._factory.createDummyAttributesForFacts(),
                        { x: select.x+select.width+ 100, 
                        y: select.y+select.height/2,}
                    );
                    fact = that._modeling.createShape(
                        fact, {x: fact.x, y:fact.y}, 
                        select.parent
                    );
                    // find a free position
                    let pos = that._placement.place(select, fact);
                    fact.x = pos.x;
                    fact.y = pos.y;
                    // add entity as a role to the fact
                    let con = that._modeling.connectToFact(fact, select, 0);
                    that._modeling.sendUpdates(con,fact,select);
                }
            }
        }
    }

    /**
     * Toggles the keyboard help menu on the following keydowns:
     * 'ctrl + k', 'ctrl + K'
     * @param {*} that 
     * @param {*} context 
     */
    triggerKeyboardHelpMenu(that, context){
        const event = context.keyEvent;
        if (event.ctrlKey){
            if (isKey(['k', 'K'], event)){
                that._eventbus.fire('keyboard.controls.toggle');
                event.stopPropagation();
            }
        }
    }

    triggerConstraintIncrease(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isKey(['+', '=', 'Plus', 'Equal'], event)){
                    if (isValueConstraint(select)){
                    event.stopPropagation();
                    select.increaseWidth();
                    that._modeling.sendUpdate(select);
                }
            }
        }
    }

    triggerConstraintDecrease(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isKey(['-', '_', 'Minus'], event)){
                    if (isValueConstraint(select)){
                    event.stopPropagation();
                    select.decreaseWidth();
                    that._modeling.sendUpdate(select);
                }
            }
        }
    }

    triggerAlignmentToggle(that, context){
        const event = context.keyEvent;
        const selected = that._selection.get();
        if (selected.length === 1){
            const select = selected[0];
            if (event.ctrlKey){
                return;
            }
            if (isKey(['a', 'A'], event)){
                event.stopPropagation();
                that._modeling.toggleAlignment(select);
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
    'ormConnect',
    'ormSubtyping',
    'placementModule'
];