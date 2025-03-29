import { getNextIdentifier } from "./util";
import { 
    Connection, Shape, 
    Element, Label } from "diagram-js/lib/model/Types";

export interface entity extends Shape {
    id: string;
    name: string;
    ref: string;
    type: "value" | "entity",
    width: number;
    height: number;
    x: number;
    y: number;
    children: Shape[];
    attachers: Shape[];
}

export function createEntity(
    name: string, 
    ref: string, 
    type: "value" | "entity", 
    width: number, 
    height: number, 
    x: number, 
    y: number): entity {
    
    if (type === "value") {
        return new ValueEntity(name, ref, width, height, x, y);
    } else {
        return new Entity(name, ref, width, height, x, y);
    }
}

export class ValueEntity implements entity {
    id: string;
    name: string;
    ref: string;
    type: "value" | "entity";
    width: number;
    height: number;
    x: number;
    y: number;
    businessObject?: any;
    label?: Label | undefined;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];
    children: Shape[];
    attachers: Shape[];

    constructor(name: string, ref: string, width: number, height: number, x: number, y: number) {
        this.id = "v-entity-" + getNextIdentifier();
        this.name = name;
        this.ref = ref;
        this.type = "value";
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.children = [];
        this.outgoing = [];
        this.incoming = [];
        this.labels = [];
        this.parent = undefined;
        this.attachers = [];
    }

    flipType() {
        if (this.type === "value") {
            this.type = "entity";
        } else {
            this.type = "value";
        }
    }
    
}

export class Entity implements entity {
    id: string;
    ref: string;
    type: "entity" | "value";
    width: number;
    height: number;
    x: number;
    y: number;
    name: string;
    businessObject?: any;
    label?: Label | undefined;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];
    children: Shape[];
    attachers: Shape[];
    
    constructor(name: string, ref: string, width: number, height: number, x: number, y: number) {
        this.id = "e-entity-" + getNextIdentifier();
        this.ref = ref;
        this.type = "entity";
        this.name = name;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.children = [];
        this.outgoing = [];
        this.incoming = [];
        this.labels = [];
        this.parent = undefined;
        this.attachers = [];
    }

    flipType() {
        if (this.type === "value") {
            this.type = "entity";
        } else {
            this.type = "value";
        }
    }
}