
import { ShapeLike } from "diagram-js/lib/model/Types";
import { getNextIdentifier } from "./util";
import { Fact } from "./facts";

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
    x: number,
    y: number,
    width: number,
    height: number,
    over: Array<number>,
    roles: number): constraint {
    return new SimpleConstraint(
        x, y,
        width, height,
        over, roles);
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
    roles: number;
    editing: boolean;
    src?: Fact;

    constructor(
        x: number, y: number,
        width: number, height: number,
        over: Array<number>,  roles: number) {
        this.id = "constraint-" + getNextIdentifier();
        this.type = "constraint";
        this.mode = constraintType.SIMPLE;
        this.over = over;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.roles = roles;
        this.editing = false;
    }

    /**
     * Set is the contraints is settled or not.
     * @param editing whether the constraint is being edited
     */
    setEditing(editing: boolean) {
        this.editing = editing;
    }

    /**
     * flips the role of the constraint.
     * @param role the role to be flipped
     */
    flipRole(role: number) {
        if (this.over.includes(role)) {
            this.over = this.over.filter((r) => r !== role);
        } else {
            this.over.push(role);
        }
    }

    /**
     * Checks whether the constraint is role constrained.
     * @param role the role to be checked
     * @returns {boolean} whether the constraint is role constrained
     */
    isRoleConstrainted(role: number): boolean {
        return this.over.includes(role);
    }

    setSource(fact: Fact) {
        this.src = fact;
    }

    refreshConstraintedRoles() {
        this.over = this.over.filter(
            (r) => r < this.roles
        );
    }

    buildAttributes(): any {
        return {
            id: this.id,
            type: this.type,
            mode: this.mode,
            over: this.over,
        };
    }
}