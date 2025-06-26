
// @ts-ignore
import { PREFIX } from '../builder.js';
// @ts-ignore
import { OBJECT_VALUE_MODE as MODE } from '../constraints.js';
import { ValueConstraint } from '../model/valueConstraint';
import ConstraintHandler, { ConstraintContext } from './ConstraintHandler';

interface ObjectValueContext extends ConstraintContext {
    constraint: ValueConstraint; // The constraint being created
}
/**
 * The object value constraint handler constraints over objects
 * the mode 'object-value'.
 */
export default class ObjectValueConstraintHandler extends ConstraintHandler {
   
    static $inject = [
        'eventBus',
        'elementFactory',
        'modeling',
        'rules',
        'directEditing'
    ];
    _eventBus:any;
    _factory:any;
    _modeling:any;
    _rules:any;
    _directEditing:any;
    _added: boolean = false;

    constructor(eventBus:any, factory:any, modeling:any, rules:any, directEditing:any) {
        super(eventBus);
        this._eventBus = eventBus;
        this._factory = factory;
        this._modeling = modeling;
        this._rules = rules;
        this._directEditing = directEditing;


        this._eventBus.on(
            `${PREFIX}${MODE}.click`,
            this.click.bind(this)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.move`,
            this.move.bind(this)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.canceled`, `${PREFIX}${MODE}.cancel`],
            this.cancel.bind(this)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.cleanup`,
            this.cleanup.bind(this)
        );
    }

    prepareData(context:any) : ObjectValueContext {
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

    move(event: ObjectValueContext) {
        let constraint = event.constraint;

        const { x, y } = event;

        constraint.x = x - constraint.width / 2;
        constraint.y = y - constraint.height / 2;
        this._modeling.sendUpdate(constraint);
    }

    click(event : ObjectValueContext) {
        this.end(event);
        this._added = true;
        this._builder.end(event);
    }

    end(event: ObjectValueContext) {
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
    }

    cleanup(event: ObjectValueContext): void {
        if (!this._added) {
            let constraint = event.constraint;
            this._modeling.removeElements([constraint]);
        }
        this._added = false;
    }

    cancel(event: ObjectValueContext): void {
        let constraint = event.constraint;
        this._modeling.removeElements([constraint]);
    }
}