import ConstraintHandler from './ConstraintHandler';

import { PREFIX } from '../builder.js';
import { OBJECT_VALUE_MODE as MODE } from '../constraints.js';

/**
 * The object value constraint handler constraints over objects
 * the mode 'object-value'.
 */
export default class ObjectValueConstraintHandler extends ConstraintHandler {
   
    /**
     * 
     * @param {*} eventBus 
     * @param {*} factory 
     * @param {*} modeling 
     * @param {*} rules
     */
    constructor(eventBus, factory, modeling, rules, directEditing) {
        super(eventBus);
        this._eventBus = eventBus;
        this._factory = factory;
        this._modeling = modeling;
        this._rules = rules;
        this._directEditing = directEditing;


        this._eventBus.on(
            `${PREFIX}${MODE}.click`,
            (event) => this.click(event)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.move`,
            (event) => this.move(event)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.cancel`, `${PREFIX}${MODE}.cancelled`],
            (event) => this.cancel(event)
        );
    }

    prepareData(context) {
        const data = super.prepareData(context);

        let dummyState = this._factory
            .createDummyAttributesForValueConstraint(
                data.source,
            );
        let constraint = this._modeling.createShape(
            Object.assign({}, dummyState),
            {x: dummyState.x, y: dummyState.y },
            data.source.parent
        );

        setTimeout(() => {
            this._directEditing.cancel();
        }, 30);


        return Object.assign(data, {
            mode: MODE,
            constraint: constraint
        });
    }

    move(event) {
        let constraint = event.constraint;

        const { x, y } = event;

        constraint.x = x - constraint.width / 2;
        constraint.y = y - constraint.height / 2;
        this._modeling.sendUpdate(constraint);
    }

    click(event) {
        let source = event.source,
            constraint = event.constraint,
            that = this;
        
        source.addConstraint(constraint);
        this._modeling.sendUpdates(source, constraint);
        setTimeout( () =>
            that._eventBus.fire(
                'label.edit.trigger',
                {
                    element: constraint,
                }
            )
        , 25);
        this._builder.end(event);
    }

    cleanup(event) {
        let constraint = event.constraint;
        this._modeling.removeElements([constraint]);
    }
}

ObjectValueConstraintHandler.$inject = [
    'eventBus',
    'elementFactory',
    'modeling',
    'rules',
    'directEditing'
];