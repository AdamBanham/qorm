import ElementFactory from "diagram-js/lib/core/ElementFactory";

import { createEntity, entity} from "../model/entities";
import { createFact, fact } from "../model/facts";

/**
 * @type ElementFactory
 */
export default class OrmElementFactory extends ElementFactory{
    constructor() {
        super();
    }

    /**
     * 
     * @param {string} type 
     * @param {Obejct} attrs 
     * @returns {entity | fact}
     */
    create(type, attrs)
    {
        type = attrs.type || type;
        if (type === 'entity') {
            return createEntity(attrs.label, attrs.ref, 
                attrs.type, attrs.width, attrs.height, 
                attrs.x, attrs.y);
        }
        if (type === 'value') {
            return createEntity(attrs.label, attrs.ref, 
                attrs.type, attrs.width, attrs.height, 
                attrs.x, attrs.y);
        }
        if (type === 'fact') {
            return createFact(attrs.factors, attrs.x, attrs.y);
        }
        if (type === 'connection'){
            attrs['type'] = 'connection';
            return super.create(type, attrs);
        }
        if (type === 'label'){
            attrs['type'] = 'label';
            return super.create(type, attrs);
        }
        throw new Error('Unknown element type: ' + type);
    }

    /**
     * @param {"entity" | "value"} type
     * @return {entity}
     */
    createDummyAttributesForEntities(type){
        return {
            label: 'Foobar',
            ref: 'Nr',
            type: type,
            width: 100,
            height: 75,
            x: 0,
            y: 0
        };
    }

    /**
     * 
     * @returns {fact}
     */
    createDummyAttributesForFacts(){
        return {
            factors: [null],
            width: 25,
            height: 25,
            type: 'fact',
            x: 0,
            y: 0
        };
    }
}