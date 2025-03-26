import Modeling from 'diagram-js/lib/features/Modeling/Modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';

import { Fact } from "../model/facts";
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
        this._eventBus.fire('element.changed', {element: element});
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
            console.log("modeler::removeConnectionFromFact::", fact.incoming[inc]);
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
        if (!pos){
            added = fact.setNextMissingRole(entity);
        } else {
            try {
                added = fact.setRole(entity, pos);
            }
            catch (e){}
        }
        let con = null;
        if (added){
            con = this.connect(entity, fact);
            this.sendUpdates(con,fact,entity);
        }
        return con;
    }
        
}