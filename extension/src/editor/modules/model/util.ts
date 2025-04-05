import { ShapeLike } from "diagram-js/lib/model/Types";
import { entity, Entity, ValueEntity } from "./entities";
import { fact } from "./facts";

let id = 0;

/**
 * 
 * @returns {number} the next identifier
 */
export function getNextIdentifier () {
    id++;
    return id;
}

/**
 * Determines if the shape is a fact type.
 * @param {ShapeLike} shape 
 * @returns {boolean} whether the shape is a fact type.
 */
export function isFact(shape: ShapeLike): shape is fact {
    if (shape.type){
        return shape.type === "fact";
    }
    return false;
}

/**
 * Determines if the shape is an entity type.
 * @param {ShapeLike} shape 
 * @returns {boolean} whether the shape is an entity type.
 */
export function isEntity(shape: ShapeLike): shape is entity {
    if (shape.type){
        return shape.type === "entity" || shape.type === "value";
    }
    return false;
}

/**
 * Checks whetherthe shape is a Entity entity.
 * @param shape the shape to check
 * @returns 
 */
export function isExactlyEntity(shape: ShapeLike): shape is Entity {
    if (shape.type){
        return shape.type === "entity";
    }
    return false;
}

/**
 * Checks whetherthe shape is a Value entity.
 * @param shape the shape to check
 * @returns 
 */
export function isExactlyValue(shape: ShapeLike): shape is ValueEntity {
    if (shape.type){
        return shape.type === "value";
    }
    return false;
}


/**
 * Determines if the shape is a label type.
 * @param {ShapeLike} shape the shape to check 
 * @returns {boolean} whether the shape is a label type.
 */
export function isLabel(shape: ShapeLike): boolean {
    if (shape.type){
        return shape.type === "label";
    }
    return false;
}

/**
 * Determines if the shape is a constraint type.    
 * @param shape the shape to check
 * @returns whether the shape is a constraint type
 */
export function isConstraint(shape: ShapeLike): boolean {
    if (shape.type){
        return shape.type === "constraint";
    }
    return false;
}