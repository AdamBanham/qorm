import { ShapeLike } from "diagram-js/lib/model/types";
import { entity } from "./entities";
import { getNextIdentifier } from "./util";

export const unitWidth = 25;
export const unitHeight = 25;

export interface fact {
    id: string;
    roles: number;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;
    hovered?: boolean;
}

export function createFact(
    factors: Array<entity | null>,
    x: number,
    y: number): fact {
    return new Fact(factors, unitWidth * factors.length, unitHeight, x, y);
}

export class Fact implements fact {
    id: string;
    roles: number;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;
    hovered?: boolean;

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
    }

    addRole(){
        this.roles = this.roles + 1;
        this.factors = this.factors.concat(...[null]);
        this.width = this.width + unitWidth;
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
        return temp;
    }

    /**
     * Clears the role with the given entity, otherwise clears at the given position.
     * @param {entity} entity
     * @param {number} pos 
     */
    clearRole(entity:entity, pos:number){
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
        if (pos !== null){
            if (pos >= 0 && pos < this.roles){
                    this.factors[pos] = null;
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
     * @return {boolean} whether it was added
     */
    setNextMissingRole(entity:entity){
        if (!this.hasMissingRole()){
            return false;
        }
        for(let i = 0; i < this.roles; i++){
            if (!this.factors[i]){
                this.factors[i] = entity;
                break;
            }
        }
        return true;
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
            Math.floor((posX - this.x) / unitWidth)
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
}

