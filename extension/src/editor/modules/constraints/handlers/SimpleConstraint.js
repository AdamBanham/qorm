import ConstraintHandler from './ConstraintHandler';

import { PREFIX } from '../builder.js';
const MODE = 'simple';

/**
 * A simple constraint handler constraints over facts via
 * the mode 'simple'.
 */
export default class SimpleConstraintHandler extends ConstraintHandler {
   
    /**
     * 
     * @param {*} eventBus 
     * @param {*} factory 
     * @param {*} modeling 
     * @param {*} rules
     */
    constructor(eventBus, factory, modeling, rules) {
        super(eventBus);
        this._eventBus = eventBus;
        this._factory = factory;
        this._modeling = modeling;
        this._rules = rules;


        this._eventBus.on(
            `${PREFIX}${MODE}.click`,
            (event) => this.click(event)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.cleanup`,
            (event) => this.cleanup(event)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.cancel`, `${PREFIX}${MODE}.cancelled`],
            (event) => this.cancel(event)
        );
    }

    prepareData(context) {
        const data = super.prepareData(context);
        var attrs = this._factory
            .createDummyAttributesForConstraintOverFact(data.source);
        var constraint = this._modeling.createShape(
            Object.assign({}, attrs),
            {x: attrs.x, y: attrs.y },
            data.source.parent
        );
        constraint.setEditing(true);
        this._modeling.sendUpdate(constraint);
        return Object.assign(data, {
            mode: MODE,
            constraint: constraint
        });
    }

    click(event) {
        event.stopPropagation();
        let role = event.source.findNearestRoleUsingPosX(
            event.x
        );
        if (role < 0) {
            return;
        }
        event.constraint.flipRole(role);
        this._rules.allowed('constraint.create', {
            mode: event.mode,
            constraint: event.constraint,
            fact: event.source,
        });
        this._modeling.sendUpdate(event.constraint);
    }

    cleanup(event) {
        event.constraint.setEditing(false);

        let allowed = this._rules.allowed('constraint.create', {
            mode: event.mode,
            constraint: event.constraint,
            fact: event.source,
        });

        if (allowed) {
            event.source.addConstraint(event.constraint);
            this._modeling.sendUpdates(event.constraint, event.source);
        } else {
            this._modeling.removeElements([event.constraint]);
        }
    }

    cancel(event) {
        this._modeling.removeElements([event.constraint]);
    }
}

SimpleConstraintHandler.$inject = [
    'eventBus',
    'elementFactory',
    'modeling',
    'rules'
];