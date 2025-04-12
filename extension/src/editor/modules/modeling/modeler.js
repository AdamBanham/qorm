import Modeling from 'diagram-js/lib/features/modeling/modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import { Connection } from 'diagram-js/lib/model';

import { Fact, unitHeight, unitWidth } from "../model/facts";
import { entity, ValueEntity, Entity } from "../model/entities";
import { isConnection } from 'diagram-js/lib/util/ModelUtil';

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
        if (element !== null){
            // TODO: I dont think I need this line anymore
            // this.moveElements([element], {x:0,y:0});
            // things usually fire on elements changed rather than element.changed
            this._eventBus.fire('elements.changed', {elements: [element], layout:false});
            this._eventBus.fire('element.changed', {element: element, layout:false});    
        }
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
        this.sendUpdates(fact);
        return remove;
    }

    /**
     * 
     */
    clearConnection(con){
        var fact = con.target;
        var entity = con.source;
        fact.clearRole(entity,con.role);
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
            this.clearConnection(con);
            this.removeElements([con]);
            this.sendUpdates(fact, entity);
        }   
    }

    /**
     * Connects an entity to a fact
     * @param {Fact} fact 
     * @param {Entity | ValueEntity} entity 
     * @param {number} pos
     * @returns {Connection | null} the created connection
     */
    connectToFact(fact, entity, pos=undefined){
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
            let attrs = this._elementFactory.createDummyAttributesForConnection(pos);
            con = this.connect(entity, fact, attrs);
            this.sendUpdates(con,fact,entity);
            this.moveElements([con,fact, entity], {x:0, y:0});
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

    /**
     * Flips the mandatory constraint on this connection between an entity
     * and fact type.
     * @param {Connection} con 
     */
    flipMandatoryConstraint(con){
        con.mandatory = !con.mandatory;
        this.sendUpdate(con);
    }

    /**
     * Flips the type of an entity
     * @param {Entity | ValueEntity} entity 
     */
    flipEntityType(entity){
        entity.flipType();
        this.sendUpdate(entity);
    }

    removeElements(elements){
        elements.forEach(element => {
            if (isConnection(element)){
                if (element.role !== undefined){
                    this.clearConnection(element);
                }
            } 
        });
        super.removeElements(elements);
    }

    /**
     * flips the label reference mode of a given entity.
     * @param {Entity} entity 
     */
    flipLabelReference(entity){
        entity.flipReferenceMode();
        this.sendUpdate(entity);
    }

    /**
     * flips the objectification of a fact.
     * @param {Fact} fact 
     */
    flipObjectification(fact){
        if (fact.objectified){
            fact.objectified = false;
        } else {
            fact.objectified = true;
        }
        this.sendUpdate(fact);
    }
        
}