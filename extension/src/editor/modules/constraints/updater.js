import { isFact } from "../model/util";

export default class ConstraintWatcher {

    constructor(eventBus, modeling) {
        this._eventBus = eventBus;
        this._modeling = modeling;

        this._eventBus.on(
            'element.changed'
            , (event) => {
                if (isFact(event.element)) {
                    this.update(event.element);
                }
                return event;
        });
    }

    update(fact) {
        fact.refreshConstraintPositions();
        for(var constraint of fact.constraints) {
            constraint.roles = fact.roles;
            constraint.refreshConstraintedRoles();
        }
        setTimeout(() => {
            this._modeling.sendUpdates(...fact.constraints);
        }, 2);
    }
}

ConstraintWatcher.$inject = [
    'eventBus',
    'modeling',
    'rules'
];