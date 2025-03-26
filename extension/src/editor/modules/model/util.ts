import { ShapeLike } from "diagram-js/lib/model/types";
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
 * 
 * @param element 
 */
export function isFact(element:ShapeLike | entity | fact){
    if (element.type){
        return element.type === 'fact'
    }
}