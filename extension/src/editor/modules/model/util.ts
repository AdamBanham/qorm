import { ConnectionLike, ShapeLike } from "diagram-js/lib/model/Types";
import { entity, Entity, ValueEntity } from "./entities";
import { Fact } from "./facts";
import { OrmSubtypeConnection, SUBTYPE_NAME } from "./subtypes";

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
export function isFact(shape: ShapeLike): shape is Fact {
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
export function isEntity(shape: ShapeLike): shape is Entity {
    if (shape.type){
        return shape.type === "entity" || shape.type === "value";
    }
    return false;
}

/**
 * Checks whether a given connection is subtyping
 * @param {ConnectionLike} connection 
 * @returns {boolean} whether the connection is a subtype connection
 */
export function isSubtype(connection: ConnectionLike): connection is OrmSubtypeConnection {
    if (connection.type){
        return connection.type === SUBTYPE_NAME
    }
    return false
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
 * @param {ShapeLike} shape the shape to check
 * @returns {boolean} whether the shape is a constraint type
 */
export function isConstraint(shape: ShapeLike): boolean {
    if (shape.type){
        return shape.type === "constraint";
    }
    return false;
}

/**
 * Checks whether the reference mode of entity by value
 * @param {ShapeLike} shape the shape to check
 * @returns {boolean} whether the shape has a reference and it is a value reference
 */
export function isValueReference(shape: ShapeLike): boolean {
    if (isEntity(shape)){
        return shape.referenceMode === "value";
    }
    return false;
}

/**
 * Checks whether the reference mode of entity by unit-based
 * @param {ShapeLike} shape the shape to check
 * @returns {boolean} whether the shape has a reference and it is a 
 * unit-based reference
 */
export function isUnitReference(shape: ShapeLike): boolean {
    if (isEntity(shape)){
        return shape.referenceMode === "unit-based";
    }
    return false;
}

/**
 * Checks whether the reference mode of entity by reference
 * @param {ShapeLike} shape the shape to check
 * @returns {boolean} whether the shape has a reference and it is a 
 * referred reference
 */
export function isReferredReference(shape: ShapeLike): boolean {
    if (isEntity(shape)){
        return shape.referenceMode === "reference";
    }
    return false;
}