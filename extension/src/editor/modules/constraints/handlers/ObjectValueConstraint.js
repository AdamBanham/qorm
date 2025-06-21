import ConstraintHandler from './ConstraintHandler.js';

import { PREFIX } from '../builder.js';
const MODE = 'object-value';

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
            `${PREFIX}${MODE}.cleanup`,
            (event) => this.cleanup(event)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.cancel`, `${PREFIX}${MODE}.cancelled`],
            (event) => this.cancel(event)
        );
    }

    prepareData(context) {
        console.log(context);
        const data = super.prepareData(context);

        let constraint = this._factory
            .createDummyAttributesForValueConstraint(
                data.source,
            );
        constraint = this._modeling.createShape(
            Object.assign({}, constraint),
            {x: constraint.x, y: constraint.y },
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
        
    }

    cleanup(event) {
        this.move(event);

        let source = event.source,
            constraint = event.constraint;
        
        source.addConstraint(constraint);

        this._eventBus.fire(
            'label.edit.trigger',
            {
                element: constraint,
            }
        );
    }

    cancel(event) {
        this._modeling.removeElements([event.constraint]);
    }
}

ObjectValueConstraintHandler.$inject = [
    'eventBus',
    'elementFactory',
    'modeling',
    'rules',
    'directEditing'
];