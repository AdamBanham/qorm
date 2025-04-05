import Builder from './builder';
import { PREFIX } from './builder';
import EventBus from 'diagram-js/lib/core/EventBus';
import Modeling from 'diagram-js/lib/features/modeling/Modeling';

import SimpleConstraintHandler from './handlers/SimpleConstraint.js';

/**
 * This module is responsible for managing the creation 
 * of constraints in the editor.
 * @module constraints
 */
export default class ContraintsModule {

    /**
     * @param {EventBus} eventBus 
     * @param {Modeling} modeling 
     * @param {Builder} dragging 
     */
    constructor(eventBus, modeling, builder, elementFactory) {
        this._builder = builder;
        this._eventBus = eventBus;
        this._modeling = modeling;

        // register event listeners
        var that = this;
        this._eventBus.on('fact.create.constraint', (context) => {
            that.init(context);
        });

        this._registry = {
            'simple' : new SimpleConstraintHandler(
                eventBus, elementFactory, modeling 
            )
        };
    }

    /**
     * The trigger point for a constraint builder.
     * @param {Object} context 
     * @param {Fact} context.fact The fact element to constrain.
     * @param {string} context.mode The mode of the builder.
     * @param {Object} context.orginalEvent A mouse event.
     * 
     */ 
    init(context) {
        var controller = this._registry[context.mode];
        if (!controller) {
            throw new Error('no constraint handler found');
        }
        this.active = true;
        this._builder.init(context.orginalEvent, 
            PREFIX + context.mode, {
            data : controller.prepareData(context),
            autoActivate: false,
        });
    }
}

ContraintsModule.$inject = [
    'eventBus',
    'modeling',
    'constraintsBuilder',
    'elementFactory',
];