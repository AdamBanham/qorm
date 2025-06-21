import { ValueConstraint, TYPE as VC_TYPE } from "./valueConstraint";
import { isEntity, isFact } from "../../model/util";

/**
 * Checks if the given shape is a ValueConstraint.
 * @param {object} shape shape to check
 * @returns {boolean} true if the shape is a ValueConstraint, false otherwise
 */
export function isValueConstraint(shape: any): shape is ValueConstraint {
    if (shape && shape.type && shape.type === VC_TYPE) {
        return true;
    }
    return false;
}

/**
 * Checks if the given shape is an object value constraint.
 * @param shape the shape to check
 * @returns {boolean} true if the shape is an object value constraint, false otherwise
 */
export function isObjectValueConstraint(shape: any): 
    shape is ValueConstraint {
    if (isValueConstraint(shape)) {
        if (isEntity(shape.source)) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if the given shape is a role value constraint.
 * @param shape the shape to check
 * @returns {boolean} true if the shape is a role value constraint, false otherwise
 */
export function isRoleValueConstraint(shape: any):
    shape is ValueConstraint {
    if (isValueConstraint(shape)) {
        if (shape.source && isFact(shape.source)) {
            return true;
        }
    }
    return false;
}