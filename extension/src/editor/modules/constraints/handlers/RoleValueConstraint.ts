import ConstraintHandler from "./ConstraintHandler";
import { ValueConstraint } from "../model/valueConstraint";

import { PREFIX } from "../builder.js";
import { ROLE_VALUE_MODE as MODE } from "../constraints.js";
import { isWithinShape } from "../../utils/canvasUtils";
import { Fact } from "../../model/facts";

export interface RoleValueConstruction {
    state: "selecting" | "moving";
    factor: number;
    constraint: ValueConstraint
}

export interface RoleValueContext extends MouseEvent {
    source: Fact;
    factor?: number;
    mode: MODE;
    state: RoleValueConstruction;
}

export default class RoleValueConstraint extends ConstraintHandler {

    static $inject: Array<string> = [ 
        'eventBus', 'elementFactory', 'modeling', 
        'rules', 'directEditing'
    ];
    _eventBus: any;
    _factory: any;
    _modeling: any;
    _rules: any;
    _directEditing: any;

    constructor(eventBus:any, factory:any, 
        modeling:any, rules:any, directEditing:any) {
        super(eventBus); 
        this._eventBus = eventBus;
        this._factory = factory;
        this._modeling = modeling;
        this._rules = rules;
        this._directEditing = directEditing;

        this._eventBus.on(
            `${PREFIX}${MODE}.click`,
            (event:any) => this.click(event)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.move`,
            (event:any) => this.move(event)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.cancel`, `${PREFIX}${MODE}.cancelled`],
            (event:any) => this.cancel(event)
        );
    }

    prepareData(context: any): object {
        let data:any = super.prepareData(context);

        let dummyState = this._factory
            .createDummyAttributesForValueConstraint(
                data.source,
            );
        let constraint:ValueConstraint = this._modeling.createShape(
            Object.assign({}, dummyState),
            {x: dummyState.x, y: dummyState.y },
            data.source.parent
        );

        constraint.hide();
        this._modeling.sendUpdate(constraint);

        setTimeout(() => {
            this._directEditing.cancel();
        }, 30);

        return Object.assign(data, {
            source: context.source,
            factor: context.factor || -1,
            mode: MODE,
            state: {
                state: "selecting",
                factor: context.factor || -1,
                constraint: constraint
            }
        });
    }

    move(event:RoleValueContext) {
        let constraint = event.state.constraint;

        if (event.state.state !== "moving") {
            return;
        }

        const { x, y } = event;

        if (x !== undefined && y !== undefined) {
            constraint.x = x - constraint.width / 2;
            constraint.y = y - constraint.height / 2;
            this._modeling.sendUpdate(constraint);
        }
    }

    click(event:RoleValueContext) {
        let state = event.state,
            constraint = state.constraint,
            fact = event.source;

        if (state.state === "selecting") {
            event.stopPropagation();
            if (isWithinShape(event.source, {x: event.x, y: event.y})) {
                let role = fact.findNearestRoleUsingPosX(event.x);

                if (role < 0) {
                    return;
                }

                if (fact.hasValueConstraintOver(role)){
                    this._builder.cancel(event);
                    return;
                }

                state.factor = role;
                constraint.setRoleFactor(state.factor);
                this._modeling.sendUpdate(constraint);
                state.state = "moving";
                constraint.show();
            }

        } else if (state.state === "moving") {
            
            fact.addConstraint(constraint); 
            setTimeout( () =>
                this._eventBus.fire(
                    'label.edit.trigger',
                    {
                        element: constraint,
                    }
                )
            , 25);
            this._builder.end(event);
        }
    }

    cleanup(event: RoleValueContext) {
        let constraint = event.state.constraint;

        this._modeling.removeShapes([constraint]);
    }


}