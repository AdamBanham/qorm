import { ShapeLike } from "diagram-js/lib/model/Types";
import { Entity, ValueEntity } from "../../model/entities";
import { Fact } from "../../model/facts";
import { getNextIdentifier, isFact } from "../../model/util";

export const UNIT_WIDTH = 50;
export const UNIT_HEIGHT = 50;
export const TYPE = 'value-constraint';
const WIDTH_FACTOR = 25;

export interface valueConstraint extends ShapeLike {
    source: Entity | ValueEntity | Fact;
    factor?: number;
    description:string;
}

export function createValueConstraint(
    x: number, y: number, 
    source: Entity | ValueEntity | Fact, 
    description?:string, 
    factor?: number): ValueConstraint {
    
    return new ValueConstraint(x, y, source, description, factor);
}

/**
 * A value constraint indicates which values are allowed
 * in a value type and is sometimes called a "domain constraint".
 * For referenced or value object types, this constraint describes
 * the allowed values for the identity of the object.
 * 
 * Example: For a value type that represents a color, the object 
 * value constraint could specify that only certain color names
 * or hex codes are allowed.
 * 
 * These are represented by '{' [values]'}' where [values] could
 * be the following:
 * - a list of allowed values (e.g., 'red, green, blue')
 * - a range of values (e.g., '1..10', '..100', '(1..10])
 * - a regular expression (e.g., "'a'..'z', 'A'..'Z'")
 * - multiple value formats of the above
 */
export class ValueConstraint implements valueConstraint{
    id: string;
    x: number;
    y: number;
    type:string = TYPE;
    width: number;
    height: number;
    source: Entity | ValueEntity | Fact;
    factor?: number;
    description: string;

    constructor(
        x: number, y: number, 
        source: Entity | ValueEntity | Fact, 
        description = '...',
        factor?: number ) {
        
        this.id = `value-constraint-${getNextIdentifier()}`;
        this.x = x;
        this.y = y;
        this.width = UNIT_WIDTH;
        this.height = UNIT_HEIGHT;
        this.source = source;
        this.description = description;
        
        if (isFact(source)) {
            this.factor = factor;
        }

        this.update();
    }

    setDescription(value: string) {
        this.description = value;
        this.update();
    }

    increaseWidth() {
        this.width = this.width + WIDTH_FACTOR;
    }

    decreaseWidth() {
        this.width = Math.max(UNIT_WIDTH, this.width - WIDTH_FACTOR);
    }

    canDecreaseWidth() {
        return this.width > UNIT_WIDTH;
    }

    setRoleFactor(factor: number) { 
        if (isFact(this.source)) {
            this.factor = factor;
        }
    }

    update(){

    }

    buildAttributes(): object {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            factor: this.factor,
            description: this.description
        };
    };
};