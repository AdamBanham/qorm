import { getNextIdentifier } from "./util";
import { 
    Connection, Shape, 
    Element, Label } from "diagram-js/lib/model/Types";

export const unitHeight = 75;
export const unitWidth = 100;

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
    referenceMode: "reference" | "unit-based" | "value";
    meta?: string;
    constraints: any[];
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
    referenceMode: "reference" | "unit-based" | "value";
    subtypeOf: string[];
    meta?: string | undefined;
    constraints: any[];
    
    
    constructor(name: string, ref: string, width: number, height: number, x: number, y: number) {
        this.id = "entity-" + getNextIdentifier();
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
        this.referenceMode = "reference";
        this.meta = " ";
        this.subtypeOf = [];
        this.constraints = [];
    }

    flipType() {
        if (this.type === "value") {
            this.type = "entity";
            this.referenceMode = "reference";
        } else {
            this.type = "value";
            this.referenceMode = "value";
        }
    }

    /**
     * Sets the label reference mode.
     * @param {"reference" | "unit-based"} mode the mode
     */
    setReferenceMode(mode: "reference" | "unit-based"){
        this.referenceMode = mode;
    }
    
    /**
     * Flips the label reference mode.
     */
    flipReferenceMode(){
        if (this.referenceMode === "reference"){
            this.referenceMode = "unit-based";
        } else if (this.referenceMode === "unit-based"){
            this.referenceMode = "reference";
        }
    }

    /**
     * Sets the meta string of the entity when in unit-based mode.
     * @param {string} meta the meta string
     */
    setMetaString(meta: string){
        this.meta = meta;
    }

    /**
     * adds a subtype to the entity.
     * @param subtyp the subtyp to add
     */
    addSubtype(subtyp: Entity){
        this.subtypeOf?.push(subtyp.id);
    }

    /**
     * removes a subtype from the entity.
     * @param subtype the subtype to remove
     */
    removeSubtype(subtype: Entity){
        this.subtypeOf = this.subtypeOf?.filter((id) => id !== subtype.id);
    }

    /**
     * Checks if the entity is subtyping the given entity.
     * @param entity the entity to check against
     * @returns true if the entity is a subtype, false otherwise
     */
    isSubtypeOf(entity: Entity): boolean {
        return this.subtypeOf.includes(entity.id);
    }

    /**
     * Checks if the entity is subtyping any other entity.
     * @returns true if the entity is subtyping, false otherwise
     */
    isSubtyping(): boolean {
        return this.subtypeOf.length > 0;
    }

    hasValueConstraint(): boolean {
        return this.constraints.some(constraint => constraint.type === "value-constraint");
    }

    addConstraint(constraint: any) {
        this.constraints.push(constraint);
    };

    update() {
        
    }

    buildAttributes(): Map<string, any> {
        let attributes = new Map<string, any>();
        attributes.set("id", this.id);
        attributes.set("type", this.type);
        attributes.set("name", this.name);
        attributes.set("ref", this.ref);
        attributes.set("x", Math.fround(this.x));
        attributes.set("y", Math.fround(this.y));
        if (this.type === "entity"){
            attributes.set("referenceMode", this.referenceMode);
            attributes.set("meta", this.meta);
        }
        return attributes;
    }
}

export class ValueEntity extends Entity {
    name: string;
    ref: string;
    type: "value" | "entity";
    width: number;
    height: number;
    x: number;
    y: number;
    labels: Label[];
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];
    children: Shape[];
    attachers: Shape[];
    referenceMode: "value";

    constructor(name: string, ref: string, width: number, height: number, x: number, y: number) {
        super(name, ref, width, height, x, y);
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
        this.referenceMode = "value";
    }
    
}
