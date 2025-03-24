import { entity } from "./entities";
import { getNextIdentifier } from "./util";

interface fact {
    id: string;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;
}

export function createFact(
    factors: Array<entity | null>,
    width: number,
    height: number,
    x: number,
    y: number): fact {
    return new Fact(factors, width, height, x, y);
}

export class Fact implements fact {
    id: string;
    factors: Array<entity | null>;
    type: "fact";
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(factors: Array<entity | null>, width: number, height: number, x: number, y: number) {
        this.id = "fact-" + getNextIdentifier();
        this.factors = factors;
        this.type = "fact";
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }
}