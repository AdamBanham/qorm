import { entity } from "./entities";
import { getNextIdentifier } from "./util";
import { SimpleConstraint } from "./constraints";
import { 
    Label, Element, 
    Connection} from "diagram-js/lib/model/Types";
import { Objectification } from "./objectifiedRole";
import { ValueConstraint, TYPE as ValueConstraintType } from "../constraints/model/valueConstraint";
import { isValueConstraint } from "../constraints/model/utils";

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
    uniqueness?: Array<SimpleConstraint>;
    objectified?: boolean;
    objectifiedName?: string;
    objectification?: Objectification
    derived?: boolean;
    derivedLabel?: string;
    towards?: "right" | "left";
    alignment?: "horizontal" | "vertical";
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
    hoveredRole?: number;
    uniqueness: Array<SimpleConstraint>;
    constraints: Array<ValueConstraint>;
    objectified?: boolean | undefined;
    objectifiedName?: string;
    objectification?: Objectification | undefined;
    derived?: boolean | undefined;
    towards?: "right" | "left" | undefined;
    derivedLabel?: string | undefined;
    alignment: "horizontal" | "vertical";
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
        this.hoveredRole = undefined;
        this.uniqueness = new Array();
        this.objectifiedName = "foobar";
        this.derived = false;
        this.labels = [];
        this.incoming = [];
        this.outgoing = [];
        this.objectification = undefined;
        this.constraints = [];
        this.alignment = "horizontal"; // Default to horizontal alignment
    }
    

    addRole(){
        this.roles = this.roles + 1;
        this.factors = this.factors.concat(...[null]);
        this.updateDimensionsForAlignment();
    }

    /**
     * Removes the last role from the fact type.
     * @returns {entity | null} the entity that was removed
     */
    removeRole(){
        let temp = this.factors[this.roles - 1];
        this.roles = this.roles - 1;
        this.factors = this.factors.slice(0, -1);
        this.updateDimensionsForAlignment();
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
        if (this.isVertical()) {
            return {
                x: this.x + 0.5 * unitWidth,
                y: this.y + ((pos + 0.5) * unitHeight)
            };
        } else {
            return {
                x: this.x + ((pos + 0.5) * unitWidth),
                y: this.y + 0.5 * unitHeight
            };
        }
    }

    findNearestRoleUsingPos(posX:number, posY:number): number {
        if (this.isVertical()) {
            let pos = Math.max(0, 
                Math.floor((posY + 5 - this.y) / unitHeight)
            );
            if (pos < this.roles){
                return pos;
            } else {
                return -1;
            }
        } else {
            let pos = Math.max(0, 
                Math.floor((posX + 5 - this.x) / unitWidth)
            );
            if (pos < this.roles){
                return pos;
            } else {
                return -1;
            }
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
        if (this.isVertical()) {
            let x = this.x - (constraintDiff * (this.uniqueness.length + 1));
            let y = this.y + this.height / 2;
            return {x: x, y: y};
        } else {
            let x = this.x + this.width / 2;
            let y = this.y - (constraintDiff * (this.uniqueness.length + 1));
            return {x: x, y: y};
        }
    }

    /**
     * Adds a constraint to the fact type.
     * @param constraint the constraint to add
     */
    addUniqueness(constraint: SimpleConstraint): void {
        this.uniqueness.push(constraint);
        constraint.setSource(this);
    }

    /**
     * Removes the given constraint from the fact type.
     * @param constraint the constraint to remove
     */
    removeUniqueness(constraint: SimpleConstraint): void {
        let idx = this.uniqueness.findIndex((i,_) => {
            if (i){
                return i.id === constraint.id;
            } return false;
        });
        if (idx >= 0){
            let rem = this.uniqueness.splice(idx,1);
            for(let removed of rem){
                removed.setSource(undefined);
            }
        }
        if (this.isVertical()) {
            let curr_x = this.x - constraintDiff;
            for(let keeps of this.uniqueness){
                keeps.x = curr_x;
                curr_x = curr_x - constraintDiff;
            }
        } else {
            let curr_y = this.y - constraintDiff;
            for(let keeps of this.uniqueness){
                keeps.y = curr_y;
                curr_y = curr_y - constraintDiff;
            }
        }
    }

    /**
     * Refreshes the positions of the constraints.
     */
    refreshUniquenessPositions(): void {
        if (this.isVertical()) {
            let curr_x = this.x - constraintDiff;
            for(let keeps of this.uniqueness){
                keeps.x = curr_x;
                keeps.y = this.y;
                curr_x = curr_x - constraintDiff;
            }
        } else {
            let curr_y = this.y - constraintDiff;
            for(let keeps of this.uniqueness){
                keeps.y = curr_y;
                keeps.x = this.x;
                curr_y = curr_y - constraintDiff;
            }
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

    /**
     * Checks whether the fact has any value constraints.
     * @returns {boolean} true if the fact has value constraints, false otherwise
     */
    hasValueConstraint(): boolean {
        return this.constraints.some(
            (i) => isValueConstraint(i)
        );
    }

    /**
     * Checks whether the fact has a value constraint over the given role.
     * @param {number} role the role to check
     * @returns {boolean} true if the fact has a value constraint over the role, false otherwise
     */
    hasValueConstraintOver(role: number): boolean {
        return this.constraints.some(
            (i) => isValueConstraint(i) && 
                   i.factor && 
                   i.factor === role
        );
    }

    /**
     * Adds a constraint to the fact type or one of its roles.
     * @param constraint the value constraint to add
     */
    addConstraint(constraint: ValueConstraint): void {
        this.constraints.push(constraint);
    }

    update(){
        this.updateDimensionsForAlignment();
        if (this.labels.length > 0){
            for(let labeler of this.labels){
                if (this.isVertical()) {
                    labeler.y = this.y + (this.height / 2);
                    labeler.x = this.x + (unitWidth * 1.5) + (labeler.derived ? 25 : 0);
                } else {
                    labeler.x = this.x + (this.width / 2);
                    labeler.y = this.y + (unitHeight * 1.5) + (labeler.derived ? 25 : 0);
                }
            }
        }
        if (this.objectified){
            this.objectification?.update();
        }
        this.uniqueness.forEach((uni) => {
            uni.update();
        });
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
        if (this.alignment && this.alignment !== "horizontal"){
            attributes.set("alignment", this.alignment);
        }
        if (this.uniqueness.length > 0){
            attributes.set("uniqueness", this.uniqueness.map((i) => {
                return i.buildAttributes();
            }));
        }
        if (this.constraints.length > 0){
            attributes.set("constraints", this.constraints.map((i) => {
                return i.buildAttributes();
            }));
        }
        return attributes;
    }

    /**
     * Checks whether the fact type is vertically aligned.
     * @returns {boolean} whether the fact type is vertical
     */
    isVertical(): boolean {
        return this.alignment === "vertical";
    }

    /**
     * Checks whether the fact type is horizontally aligned.
     * @returns {boolean} whether the fact type is horizontal
     */
    isHorizontal(): boolean {
        return this.alignment === "horizontal" || this.alignment === undefined;
    }

    /**
     * Sets the alignment of the fact type.
     * @param {"horizontal" | "vertical"} alignment the alignment to set
     */
    setAlignment(alignment: "horizontal" | "vertical"): void {
        this.alignment = alignment;
        this.updateDimensionsForAlignment();
    }

    /**
     * Toggles the alignment between horizontal and vertical.
     */
    toggleAlignment(): void {
        if (this.isVertical()) {
            this.setAlignment("horizontal");
        } else {
            this.setAlignment("vertical");
        }
    }

    /**
     * Updates width and height based on current alignment.
     */
    updateDimensionsForAlignment(): void {
        if (this.isVertical()) {
            this.width = unitWidth;
            this.height = unitHeight * this.roles;
        } else {
            this.width = unitWidth * this.roles;
            this.height = unitHeight;
        }
    }

}

