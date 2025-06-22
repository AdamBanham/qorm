import Builder from './builder';
import { PREFIX } from './builder';
import EventBus from 'diagram-js/lib/core/EventBus';
import Modeling from 'diagram-js/lib/features/modeling/Modeling';

export const BUS_TRIGGER = 'constraint-builder.create';
export const SIMPLE_MODE = 'simple';
export const OBJECT_VALUE_MODE = 'object-value';
export const ROLE_VALUE_MODE = 'role-value';

import SimpleConstraintHandler from './handlers/SimpleConstraint.js';
import ObjectValueConstraintHandler from './handlers/ObjectValueConstraint.js';
import RoleValueConstraintHandler from './handlers/RoleValueConstraint';

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
    constructor(eventBus, modeling, builder, elementFactory, rules, editing) {
        this._builder = builder;
        this._eventBus = eventBus;
        this._modeling = modeling;

        // register event listeners
        var that = this;
        this._eventBus.on(BUS_TRIGGER, (context) => {
            that.init(context);
        });

        this._registry = {};
        this._registry[SIMPLE_MODE] = new SimpleConstraintHandler(
                eventBus, elementFactory, modeling, rules
        ).setBuilder(builder);
        this._registry[OBJECT_VALUE_MODE] = new ObjectValueConstraintHandler(
            eventBus, elementFactory, modeling, rules, editing
        ).setBuilder(builder);
        this._registry[ROLE_VALUE_MODE] = new RoleValueConstraintHandler(
            eventBus, elementFactory, modeling, rules, editing
        ).setBuilder(builder);

    }

    /**
     * The trigger point for a constraint builder.
     * @param {Object} context 
     * @param {Shape} context.source The fact element to constrain.
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
    'rules',
    'directEditing'
];