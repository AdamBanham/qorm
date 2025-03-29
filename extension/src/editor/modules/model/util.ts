import { ShapeLike } from "diagram-js/lib/model/Types";
import { entity } from "./entities";
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