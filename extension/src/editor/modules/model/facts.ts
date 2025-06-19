import { entity } from "./entities";
import { getNextIdentifier } from "./util";
import { constraint } from "./constraints";
import { 
    Label, Element, 
    Connection} from "diagram-js/lib/model/Types";
import { Objectification } from "./objectifiedRole";

export const unitWidth = 25;
export const unitHeight = 25;
export const constraintDiff = 10;

export interface fact extends Element {
    id: string;
    roles: number;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;
    hovered?: boolean;
    constraints?: Array<constraint>;
    objectified?: boolean;
    objectifiedName?: string;
    objectification?: Objectification
    derived?: boolean;
    derivedLabel?: string;
    towards?: "right" | "left";
}

export function createFact(
    factors: Array<entity | null>,
    x: number,
    y: number): fact {
    return new Fact(factors, unitWidth * factors.length, unitHeight, x, y);
}

export interface RoleFoundResponse {
    found: boolean;
    role: number;
}

export class Fact implements fact {
    id: string;
    roles: number;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    label?: Label | undefined;
    labels: Label[];
    x: number;
    y: number;
    hovered?: boolean;
    constraints: Array<constraint>;
    objectified?: boolean | undefined;
    objectifiedName?: string;
    objectification?: Objectification | undefined;
    derived?: boolean | undefined;
    towards?: "right" | "left" | undefined;
    derivedLabel?: string | undefined;
    businessObject?: any;
    parent?: Element | undefined;
    incoming: Connection[];
    outgoing: Connection[];

    constructor(factors: Array<entity | null>, width: number, height: number, x: number, y: number) {
        this.id = "fact-" + getNextIdentifier();
        this.roles = factors.length;
        this.factors = new Array(...factors);
        this.type = "fact";
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.hovered = false;
        this.constraints = new Array();
        this.objectifiedName = "foobar";
        this.derived = false;
        this.labels = [];
        this.incoming = [];
        this.outgoing = [];
        this.objectification = undefined;
    }
    

    addRole(){
        this.roles = this.roles + 1;
        this.factors = this.factors.concat(...[null]);
    }

    /**
     * Removes the last role from the fact type.
     * @returns {entity | null} the entity that was removed
     */
    removeRole(){
        let temp = this.factors[this.roles - 1];
        this.roles = this.roles - 1;
        this.factors = this.factors.slice(0, -1);
        this.width = this.width - unitWidth;
        if (this.roles === 1){
            this.unsetTowards();
        }
        return temp;
    }

    /**
     * Clears the role with the given entity, otherwise clears at the given position.
     * @param {entity} entity
     * @param {number} pos 
     */
    clearRole(entity:entity, pos:number){
        if (pos !== null){
            if (pos >= 0 && pos < this.roles){
                    this.factors[pos] = null;
                    return;
            }
        }
        if (entity){
            let idx = this.factors.findIndex((i,_) => {
                if (i){
                    return i.id === entity.id;
                } return false;
            });
            if (idx >= 0){
                this.factors[idx] = null;
                return;
            }
        }
    }

    /**
     * Checks whether the fact type has any missing roles.
     * @returns {boolean} is there any missing role
     */
    hasMissingRole(){
        let missing = this.factors.filter( i => !i);
        return missing.length > 0;
    }

    /**
     * May add the given entity as a factor of this fact type.
     * returns either the given entity was added.
     * @param {entity} entity  the entity to add
     * @return {RoleFoundResponse} whether it was added
     */
    setNextMissingRole(entity:entity){
        let role = -1;
        if (!this.hasMissingRole()){
            return {found: false, role: role};
        }
        
        for(let i = 0; i < this.roles; i++){
            if (!this.factors[i]){
                this.factors[i] = entity;
                role = i;
                break;
            }
        }
        return {found: true, role: role};
    }

    /**
     * sets the given entity in the pos-th role of the fact type.
     * @param {entity} role the entity to set
     * @param {number} pos the position of the role 
     */
    setRole(role:entity,pos:number){
        if (pos < 1 && pos >= this.roles){
            throw new Error("Assertion Failed :: expected pos to between :: 1 and "+this.roles+" :: but was given :: "+pos);
        } 
        this.factors[pos] = role;
        return true;
    }

    /**
     * Finds the position of role that the given entity is in.
     * @param {entity} entity the entity to find
     * @returns {number} the position of the entity or -1 if not found
     */
    findEntityPosition(entity:entity): number {
        return this.factors.findIndex((i,_) => {
            if (i){
                return i.id === entity.id;
            } return false;
        });
    }

    /**
     * Gets the center of the role at the given position.
     * @param pos the position of the role
     * @returns {x:number, y:number} the center of the role
     */
    getCenterForRole(pos:number): {x:number, y:number} {
        return {
            x: this.x + ((pos + 0.5) * unitWidth),
            y: this.y + 0.5 * unitHeight
        };
    }

    findNearestRoleUsingPosX(posX:number): number {
        let pos = Math.max(0, 
            Math.floor((posX+5 - this.x) / unitWidth)
        );
        if (pos < this.roles){
            return pos;
        } else {
            return -1;
        }
    }
            
    /**
     * Checks whether the role has been filled at the given position.
     * @param pos the pos to check
     * @returns {boolean} whether the role is filled
     */
    isFilled(pos:number) : boolean {
        return this.factors[pos] !== null;
    }

    /**
     * Helper function to get the next free position for a constraint.
     * @returns {x:number, y:number} the next free position for a constraint
     */
    getNextFreeContraintPosition(): {x:number, y:number} {
        let x = this.x + this.width / 2;
        let y = this.y - ( constraintDiff * (this.constraints.length + 1) );
        return {x: x, y: y};
    }

    /**
     * Adds a constraint to the fact type.
     * @param constraint the constraint to add
     */
    addConstraint(constraint: constraint): void {
        this.constraints.push(constraint);
        constraint.setSource(this);
    }

    /**
     * Removes the given constraint from the fact type.
     * @param constraint the constraint to remove
     */
    removeConstraint(constraint: constraint): void {
        let idx = this.constraints.findIndex((i,_) => {
            if (i){
                return i.id === constraint.id;
            } return false;
        });
        if (idx >= 0){
            let rem = this.constraints.splice(idx,1);
            for(let removed of rem){
                removed.setSource(null);
            }
        }
        let curr_y = this.y - constraintDiff;
        for(let keeps of this.constraints){
            keeps.y = curr_y;
            curr_y = curr_y - constraintDiff;
        }
    }

    /**
     * Refreshes the positions of the constraints.
     */
    refreshConstraintPositions(): void {
        let curr_y = this.y - constraintDiff;
        for(let keeps of this.constraints){
            keeps.y = curr_y;
            keeps.x = this.x;
            curr_y = curr_y - constraintDiff;
        }
    }

    /**
     * Makes the fact type objectified.
     */
    objectify(): void {
        this.objectified = true;
    }

    /**
     * Sets the direction of the verbialization.
     * @param {"left" | "right"} towards the direction of the verbialization
     */
    setTowards(towards: "right" | "left"): void {
        this.towards = towards;
    }

    /**
     * Checks whether the fact type is verbalised towards a direction.
     * @returns {boolean} whether the fact type is directed
     */
    isTowards(): boolean {
        return this.towards !== undefined;
    }

    /**
     * Removes the direction of verbialization.
     */
    unsetTowards(): void {  
        this.towards = undefined;
    }

    update(){
        this.width = unitWidth * this.roles;
        if (this.labels.length > 0){
            for(let labeler of this.labels){
                labeler.x = this.x + (this.width / 2);
            }
        }
        if (this.objectified){
            this.objectification?.update();
        }

    }

    buildAttributes(): Map<string, any> {
        var that:any = this;
        let attributes = new Map<string, any>();
        attributes.set("id", this.id);
        attributes.set("type", this.type);
        attributes.set("roles", this.roles);
        attributes.set("factors", this.factors.map((i) => i ? i.id : null));
        attributes.set("x", Math.fround(this.x,));
        attributes.set("y", Math.fround(this.y));
        if (that.labels){
            for(let labeler of that.labels){
                if (labeler.derived){
                    attributes.set("derivedLabel", labeler.content);
                } else {
                    attributes.set("label", labeler.content);
                }
            }
        }
        if (this.derived !== undefined){
            let derivedValue = this.derived;
            attributes.set("derived", derivedValue);
        }
        if (this.objectified !== undefined){
            let objectifiedValue = this.objectified;
            attributes.set("objectified", objectifiedValue);
            attributes.set("objectifiedName", this.objectifiedName);
        }
        if (this.towards){
            attributes.set("towards", this.towards);
        }
        if (this.constraints.length > 0){
            attributes.set("uniqueness", this.constraints.map((i) => {
                return i.buildAttributes();
            }));
        }
        return attributes;
    }

}

