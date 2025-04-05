
import { ShapeLike } from "diagram-js/lib/model/Types";
import { getNextIdentifier } from "./util";

export enum constraintType {
    SIMPLE
}

export interface constraint extends ShapeLike {
    id: string;
    type: "constraint";
    mode: constraintType;
    roles?: number;
    over: Array<number>;
}

export function createConstraint(
    over: Array<number>,
    x: number,
    y: number,
    roles: number): constraint {
    return new SimpleConstraint(over, x, y, roles);
}

export class SimpleConstraint implements constraint {
    id: string;
    type: "constraint";
    mode: constraintType;
    over: Array<number>;
    width: number;
    height: number;
    x: number;
    y: number;
    roles?: number;

    constructor(over: Array<number>, x: number, y: number, roles: number) {
        this.id = "constraint-" + getNextIdentifier();
        this.type = "constraint";
        this.mode = constraintType.SIMPLE;
        this.over = over;
        this.width = 0;
        this.height = 0;
        this.x = x;
        this.y = y;
        this.roles = roles;
    }
}