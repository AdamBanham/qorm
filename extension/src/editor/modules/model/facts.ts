import { entity } from "./entities";
import { getNextIdentifier } from "./util";

export const unitWidth = 25;
export const unitHeight = 25;

interface fact {
    id: string;
    roles: number;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;
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

    constructor(factors: Array<entity | null>, width: number, height: number, x: number, y: number) {
        this.id = "fact-" + getNextIdentifier();
        this.roles = factors.length;
        this.factors = new Array(...factors);
        this.type = "fact";
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }

    addRole(){
        this.roles = this.roles + 1;
        this.factors = this.factors.concat(...[null]);
        this.width = this.width + unitWidth;
    }

    removeRole(){
        this.roles = this.roles - 1;
        this.factors = this.factors.slice(0, -2);
        this.width = this.width - unitWidth;
    }

    setRole(role:entity,pos:number){
        if (pos < 1 && pos >= this.roles){
            throw new Error("Assertion Failed :: expected pos to between :: 1 and "+this.roles+" :: but was given :: "+pos);
        } 
        this.factors[pos] = role;
    }
}