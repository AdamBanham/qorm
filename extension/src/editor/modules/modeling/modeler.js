import Modeling from 'diagram-js/lib/features/Modeling/Modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';

import { Fact, unitHeight, unitWidth } from "../model/facts";
import { entity, ValueEntity, Entity } from "../model/entities";

export default class OrmModelling extends Modeling {

    /**
     * 
     * @param {EventBus} eventBus 
     * @param {ElementFactory} elementFactory 
     * @param {CommandStack} commandStack 
     */
    constructor(eventBus, elementFactory, commandStack){
        super(eventBus, elementFactory, commandStack);
    }

    sendUpdate(element){
        this.moveElements([element], {x:0,y:0});
        this._eventBus.fire('element.changed', {element: element, layout:false});
    }

    sendUpdates(...elements){
        elements.forEach(element => this.sendUpdate(element));
    }

    /**
     * Expands the fact to the right.
     * @param {Fact} fact the fact to expand
     * @param {entity} entity the entity to add
     */
    expandFact(fact, entity){
        fact.addRole();
        if (entity){
            fact.setRole(entity, fact.roles);
        }
        this.sendUpdate(fact);
    }

    /**
     * Reduces the fact from the right.
     * @param {Fact} fact 
     * @returns {Entity | ValueEntity | null} the removed entity
     */
    reduceFact(fact){
        let remove = fact.removeRole();
        this.sendUpdate(fact);
        if (remove){
            this.removeConnectionFromFact(fact, remove);
        }
        this.sendUpdates(fact.incoming);
        return remove;
    }

    /**
     * finds the connection between the fact and the entity
     * and removes it.
     * @param {Fact} fact
     * @param {Entity | ValueEntity} entity
     */
    removeConnectionFromFact(fact, entity){
        let con = null;
        for(let inc in fact.incoming){
            if (fact.incoming[inc].source.id === entity.id){
                con = fact.incoming[inc];
                break;
            }
        }
        if (con){
            this.removeConnection(con);
        }   
        this.sendUpdates(fact, entity, con);
    }

    /**
     * Connects an entity to a fact
     * @param {Fact} fact 
     * @param {Entity | ValueEntity} entity 
     * @param {number} pos
     * @returns {Connection | null} the created connection
     */
    connectToFact(fact, entity, pos){
        let added = false;
        if (pos === undefined){
            let ret = fact.setNextMissingRole(entity);
            added = ret.found;
            pos = ret.role;
        } else {
            try {
                added = fact.setRole(entity, pos);
            }
            catch (e){
                console.error("modeler::connectToFact::",
                    "Error while connecting entity to fact: ", e);
            }
        }
        let con = null;
        if (added){
            con = this.connect(entity, fact, {role : pos});
            this.sendUpdates(con,fact,entity);
        } else {
            console.error("modeler::connectToFact::",
                "Could not connect entity to fact.");
        }
        return con;
    }

    /**
     * Adds a label to the give fact.
     * @param {Fact} fact the fact to attach to
     * @param {string} label content of the label
     * @returns created label
     */
    createLabelForFact(fact, label){
        return this.createLabel(
            fact,
            { x: fact.x + fact.width / 2, 
                y: fact.y + unitHeight * 1.5
            },
            Object.assign(
                this._elementFactory.createDummyAttributesForLabel(),
                { content: label}
            )
        );
    }
        
}