
import ConstraintHandler from './ConstraintHandler';
import { ConstraintContext } from './ConstraintHandler';
import Helping from '../../help-interactions/helping.js';
import { SimpleConstraint } from '../../model/constraints';
import { Fact } from '../../model/facts';

const MODE = 'simple';
// @ts-ignore
import { PREFIX } from '../builder.js';

import EventBus from 'diagram-js/lib/core/EventBus.js';
import ElementFactory from 'diagram-js/lib/core/ElementFactory.js';
import Rules from 'diagram-js/lib/features/rules/Rules.js';
import { HelpChainBuilder } from '../../help-interactions/model';
import { isWithinShape } from '../../utils/canvasUtils';

let helper_title = `
<p> 
Click on a role of the fact to add a uniqueness constraint.
</p>
<p>
<b style="color:red">ESC</b> to cancel, 
<b style="color: darkgreen">ENTER</b> to complete.
</p>
`;
export const HelpChain = new HelpChainBuilder()
    .create(helper_title,
            "Uniqueness cosntraints must be over n - 1 roles of a fact.")
    .build();

export interface UniquenessContext extends ConstraintContext {
    source: Fact;
    constraint: SimpleConstraint;
};

/**
 * A uniqueness constraint handler constraints over facts via
 * the mode 'simple'.
 */
export default class UniquenessConstraintHandler extends ConstraintHandler {

   _eventBus: EventBus; 
   _factory: any;
   _modeling: any;
   _rules: Rules;
   _helping: Helping;
   
    /**
     * 
     * @param {*} eventBus 
     * @param {*} factory 
     * @param {*} modeling 
     * @param {*} rules
     */
    constructor(
        eventBus:EventBus, factory:ElementFactory, 
        modeling:any, rules:Rules,
        helping:Helping) {
        super(eventBus);
        this._eventBus = eventBus;
        this._factory = factory;
        this._modeling = modeling;
        this._rules = rules;
        this._helping = helping;


        this._eventBus.on(
            `${PREFIX}${MODE}.click`,
            this.click.bind(this)
        );

        this._eventBus.on(
            `${PREFIX}${MODE}.cleanup`,
            this.cleanup.bind(this)
        );

        this._eventBus.on(
            [`${PREFIX}${MODE}.cancel`, `${PREFIX}${MODE}.cancelled`],
            this.cancel.bind(this)
        );
        this._eventBus.on(
            `${PREFIX}${MODE}.end`,
            this.end.bind(this)
        );
    }

    prepareData(context: object)  {
        const data = super.prepareData(context);
        let source:Fact = data.source as Fact;
        var attrs = this._factory
            .createDummyAttributesForConstraintOverFact(data.source);
        var constraint = this._modeling.createShape(
            Object.assign({}, attrs),
            {x: attrs.x, y: attrs.y },
            source.parent
        );
        constraint.setEditing(true);
        source.addUniqueness(constraint);
        this._modeling.sendUpdates(constraint, source);
        this._helping.fire('help.start', { chain: HelpChain });
        return Object.assign(data, {
            mode: MODE,
            constraint: constraint
        });
    }

    click(event:UniquenessContext) {
        event.stopPropagation();
        let point = { x: event.x, y: event.y };
        if (!isWithinShape(event.source, point)) {
            return;
        }

        let role = event.source.findNearestRoleUsingPos(
            event.x, event.y
        );
        if (role < 0) {
            return;
        }
        event.constraint.flipRole(role);
        let allowed = this._rules.allowed('constraint.create', {
            mode: event.mode,
            constraint: event.constraint,
            fact: event.source,
        });
        if (!allowed) {
            this._helping.fire('help.error', {});
        } else {
            this._helping.fire('help.clear', {});
        }
        this._modeling.sendUpdate(event.constraint);
    }

    end(event:UniquenessContext) {
        let allowed = this._rules.allowed('constraint.create', {
            mode: event.mode,
            constraint: event.constraint,
            fact: event.source,
        });

        if (allowed) {
            this._modeling.sendUpdates(event.constraint, event.source);
        } else {
            event.source.removeUniqueness(event.constraint);
            this._modeling.removeElements([event.constraint]);
        }

    }

    cleanup(event: any): void {
        event.constraint?.setEditing(false);
        this._helping.fire('help.end', {});
    }

    cancel(event:UniquenessContext) {
        event.source.removeUniqueness(event.constraint);
        this._modeling.removeElements([event.constraint]);
    }
}

UniquenessConstraintHandler.$inject = [
    'eventBus',
    'elementFactory',
    'modeling',
    'rules'
];