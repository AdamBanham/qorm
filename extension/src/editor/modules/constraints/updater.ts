import EventBus from "diagram-js/lib/core/EventBus";

import { isEntity, isFact } from "../model/util";
import { Fact } from "../model/facts";
import { Entity } from "../model/entities";
import { isValueConstraint } from "./model/utils";
import { ValueConstraint } from "./model/valueConstraint";

export default class ConstraintWatcher {

    static $inject: Array<string>; 
    _eventBus: EventBus;
    _modeling: any;

    constructor(eventBus:EventBus, modeling:any) {
        this._eventBus = eventBus;
        this._modeling = modeling;

        this._eventBus.on(
            'element.changed'
            , (event:any) => {
                if (isFact(event.element)) {
                    this.update(event.element);
                }
                if (isEntity(event.element)) {
                    this.updateEntity(event.element);
                }
                return event;
        });

        this._eventBus.on(
            'element.removed'
            , (event:any) => {
                this.cleanup(event.element);
            }
        );
        this._eventBus.on(
            'elements.removed'
            , (event:any) => {
                event.elements.forEach(
                    (element:any) => this.cleanup(element)
                );
            }
        );
    }

    update(fact:Fact) {
        fact.refreshUniquenessPositions();
        for(var constraint of fact.uniqueness) {
            constraint.roles = fact.roles;
            constraint.refreshConstraintedRoles();
        }
        setTimeout(() => {
            this._modeling.sendUpdates(...fact.uniqueness, ...fact.constraints);
        }, 50);
    }

    updateEntity(entity:Entity) {
        setTimeout(() => {
            this._modeling.sendUpdates(...entity.constraints);
        }, 50);
    }

    cleanup(element:any) {
        if (isFact(element) || isEntity(element)) {
            this._modeling.removeElements(element.constraints);
            if (isFact(element)) {
                this._modeling.removeElements(element.uniqueness);
            }
        }
        return event;
    }
}

ConstraintWatcher.$inject = [
    'eventBus',
    'modeling',
    'rules'
];