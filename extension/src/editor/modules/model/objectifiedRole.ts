import { Connection, Element, Label, Shape, ShapeLike } from 'diagram-js/lib/model/Types';
import { Fact } from './facts';
import { getNextIdentifier } from './util';

export const OBJECTIFICATION_TYPE = 'objectification';

export interface Objectification extends ShapeLike {
    type: "objectification";
    fact: Fact;
}

export function createObjectification(fact: Fact): Objectification {
    return new ObjectifiedRole(fact);
}

export class ObjectifiedRole implements Objectification {

    id: string;
    type: 'objectification';
    width: number;
    height: number;
    x: number;
    y: number;
    fact: Fact;
    businessObject?: any;
    label?: Label | undefined;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];

    constructor(fact: Fact) {
        let id = fact.id.split('-')[1];
        this.id = `objectification-${id}`;
        this.type = OBJECTIFICATION_TYPE;
        this.label = undefined;
        this.labels = [];
        this.parent = fact;
        this.incoming = [];
        this.outgoing = [];
        this.fact = fact;
        this.x = this.fact.x - 10;
        this.y = this.fact.y - 10;
        this.y = this.y - (10 * this.fact.uniqueness.length);
        this.width = this.fact.width + 20;
        this.height = this.fact.height + 20 + 15 + (10 * this.fact.uniqueness.length);
    }

    update(){
        this.x = this.fact.x - 10;
        this.y = this.fact.y - 10;
        this.y = this.y - (10 * this.fact.uniqueness.length);
        this.width = this.fact.width + 20;
        this.height = this.fact.height + 20 + 15 + (10 * this.fact.uniqueness.length);
    }


}