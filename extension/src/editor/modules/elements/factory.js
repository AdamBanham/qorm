import ElementFactory from "diagram-js/lib/core/ElementFactory";

import { createEntity, entity} from "../model/entities";
import { createFact, fact } from "../model/facts";
import { createConstraint } from "../model/constraints";
import { createConnection } from "../model/connections";
import { unitHeight as entityHeight, unitWidth as entityWidth } from "../model/entities";
import { unitHeight as factHeight, unitWidth as factWidth } from "../model/facts";

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
        if (type === 'constraint'){
            attrs['type'] = 'constraint';
            return createConstraint(
                attrs.x, attrs.y, 
                attrs.width, attrs.height,
                attrs.over, attrs.roles
            );
        }
        if (type === 'connection'){
            attrs['type'] = 'connection';
            let basic = super.create(type, attrs)
            // TODO: workout how to extend a connection
            // let mine = createConnection(
            //     attrs.waypoints ? attrs.waypoints : [],
            //     attrs.role,
            //     attrs.mandatory ? attrs.mandatory : false
            // );
            // if (!attrs.waypoints || attrs.waypoints.length < 1){
            //     mine.waypoints = undefined
            // }
            return basic; 
        }
        if (type === 'label'){
            attrs['type'] = 'label';
            return super.create(type, attrs);
        }
       
        throw new Error('Unknown element type: ' + type);
    }

    /**
     * creates dummy attributes for an entity or value.
     * @param {"entity" | "value"} type
     * @return {entity}
     */
    createDummyAttributesForEntities(type){
        return {
            label: 'Foobar',
            ref: 'id',
            type: type,
            width: entityWidth,
            height: entityHeight,
            x: 0,
            y: 0
        };
    }

    /**
     * creates dummy attributes for a fact.
     * @returns {fact}
     */
    createDummyAttributesForFacts(){
        return {
            factors: [null],
            width: factWidth,
            height: factHeight,
            type: 'fact',
            x: 0,
            y: 0
        };
    }

    /**
     * creates dummy attributes for a label.
     * @returns {label}
     */
    createDummyAttributesForLabel(){
        return {
            content: "..."
        };
    }

    /**
     * creates dummy attributes for a constraint over a fact.
     * @param {Fact} fact 
     * @returns 
     */
    createDummyAttributesForConstraintOverFact(fact){
        let pos = fact.getNextFreeContraintPosition();
        return {
            type: 'constraint',
            width: fact.width,
            height: 3,
            x: pos.x,
            y: pos.y,
            over: [],
            roles: fact.roles, 
        };
    }

    /**
     * Makes a dummy set of attributes for connections.
     * @param {number} role the position of the fact type 
     * @returns {object} a mapping of attributes
     */
    createDummyAttributesForConnection(role){
        return {
            mandatory: false,
            role: role
        };
    }
}