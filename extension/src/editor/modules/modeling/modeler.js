import Modeling from 'diagram-js/lib/features/modeling/modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import { Connection } from 'diagram-js/lib/model';
import { SUBTYPE_NAME } from '../model/subtypes';

import { Fact, unitHeight, unitWidth } from "../model/facts";
import { entity, ValueEntity, Entity } from "../model/entities";
import { isConnection } from 'diagram-js/lib/util/ModelUtil';
import { isFact, isSubtype } from '../model/util';
import { OrmConnection } from '../model/connections';
import { TYPE as VALUE_CONSTRAINT_TYPE } from '../constraints/model/valueConstraint';
import { isValueConstraint } from '../constraints/model/utils';

export default class OrmModelling extends Modeling {

    /**
     * 
     * @param {EventBus} eventBus 
     * @param {ElementFactory} elementFactory 
     * @param {CommandStack} commandStack 
     */
    constructor(eventBus, elementFactory, commandStack, canvas){
        super(eventBus, elementFactory, commandStack);
        this._canvas = canvas;  
    }

    createShape(shape, position, target, parentIndex, hints){
        let ret = super.createShape(shape, position, target, parentIndex, hints);
        this._eventBus.fire('shape.created', {shape: ret});
        return ret;
    }

    sendUpdate(element){
        if (element !== null){
            // TODO: I dont think I need this line anymore
            // this.moveElements([element], {x:0,y:0});
            // things usually fire on elements changed rather than element.changed
            this._eventBus.fire('elements.changed', {elements: [element], layout:false});
            this._eventBus.fire('element.changed', {element: element, layout:false}); 
            if (isFact(element)){
                if (element.objectified && element.objectification){
                    this.sendUpdate(element.objectification);
                }
            }   
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
        fact.update();
        if (fact.incoming){
            for(let con of fact.incoming){
                this.layoutConnection(con);
            }
        }
        this.sendUpdates(fact,...fact.labels);
    }

    /**
     * Reduces the fact from the right.
     * @param {Fact} fact 
     * @returns {Entity | ValueEntity | null} the removed entity
     */
    reduceFact(fact){
        let remove = fact.removeRole();
        if (remove){
            this.removeConnectionFromFact(fact, remove);
        }
        fact.update();
        if (fact.incoming){
            for(let con of fact.incoming){
                this.layoutConnection(con);
            }
        }
        this.sendUpdates(fact, ...fact.labels);
        return remove;
    }

    /**
     * Handles the attributes of the source and target of the connection
     * to ensure that the data model is updated correctly.
     * @param {OrmConnection} con the connection to layout
     */
    clearConnection(con){
        if (isSubtype(con)){
            // TODO: remove subtype connection
            if (con.source && con.target){
                con.source.removeSubtype(con.target);
            }
            return;
        }
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
            this.layoutConnection(con);
            this.sendUpdates(con,fact,entity);
            this.moveElements([con,fact,entity], {x:0,y:0});
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
        let factLabel = this.createLabel(
            fact,
            { x: fact.x + fact.width / 2, 
                y: fact.y + unitHeight * 1.5
            },
            Object.assign(
                this._elementFactory.createDummyAttributesForLabel(),
                { content: label, factLabel: true }
            ),
            fact.parent
        );
        fact.update();
        this.sendUpdates(fact, ...fact.labels);
        return factLabel;
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
            // remove the objectification
            this.removeElements([fact.objectification]);
            fact.objectification = null;
        } else {
            let attrs = this._elementFactory
                .createDummyAttributesForObjectification(fact);
            let objectification = this.createShape(
                attrs, {x: 0, y: 0},
                this._canvas.getRootElement(),);
            fact.objectified = true;
            fact.objectification = objectification;
            objectification.update();
            this.moveElements([fact, objectification], {x:1, y:1});
            this.moveElements([fact, objectification], {x:-1, y:-1});
            this.sendUpdates(fact, objectification);
        }
        this.sendUpdate(fact);
    }

    /**
     * flips the derivation of a fact.
     * @param {Fact} fact 
     */
    flipDerivation(fact){
        if (fact.derived){
            fact.derived = false;
            this.removeDerivedLabel(fact);
        } else {
            fact.derived = true;
            this.makeDerivedLabel(fact, "...");
        }
        fact.update();
        this.sendUpdates(fact, ...fact.labels);
    }

    /**
     * Changes the label of the derviation of the fact
     * @param {Fact} fact 
     * @param {string} label 
     */
    changeDerivedLabel(fact, label){
        if (isFact(fact) && fact.derived) {
            for(let labels in fact.labels){
                if (fact.labels[labels].derived){
                    fact.labels[labels].content = label;
                    this.sendUpdate(fact);
                    return;
                }
            }
        }
    }

    /**
     * Creates a derived label for the fact.
     * @param {Fact} fact 
     * @param {string} label 
     * @returns {} the created label
     */
    makeDerivedLabel(fact, label){
        let attrs = this._elementFactory.createDummyAttributesForDerivedLabel();
        let ret = this.createLabel(
            fact,
            { x: fact.x + fact.width / 2, 
                y: fact.y + unitHeight * 1.5 + 25
            },
            Object.assign(attrs, { content: label})
        );
        fact.update();
        this.sendUpdates(fact, ...fact.labels);
        return ret;
    }

    removeDerivedLabel(fact){
        for(let labels in fact.labels){
            if (fact.labels[labels].derived){
                this.removeElements([fact.labels[labels]]);
                break;
            }
        }
        this.sendUpdates(fact, ...fact.labels);
    }

    removeElements(elements){
        this._eventBus.fire('elements.removed', {elements: elements});
        super.removeElements(elements);
    }

    removeShape(element){
        this._eventBus.fire('shape.removed', {element: element});
        super.removeShape(element);
    }

    /**
     * Removes all extra entities as required when a fact is removed.
     * @param {Fact} fact 
     */
    removeFact(fact){
        if (isFact(fact)){
            if (fact.uniqueness.length > 0){
                for(let constraint of fact.uniqueness){
                    this.removeShape(constraint);
                }
            }
            this.removeShape(fact);
        }
    }

    updateWaypoints(con, waypoints, hints){
        super.updateWaypoints(con, waypoints, hints);
        this.layoutConnection(con, hints);
        this.sendUpdate(con);
    }

    removeConnection(con){
        this._eventBus.fire('shape.removed', {element: con});   
        this.clearConnection(con);
        super.removeConnection(con);
    }

    /**
     * Creates a subtype relationship between two entities.
     * @param {Entity} src 
     * @param {Entity} tgt 
     */
    createSubtypeBetween(src, tgt){
        let con = this.connect(src, tgt, {
            type: SUBTYPE_NAME,
            source: src,
            target: tgt
        });
        src.addSubtype(tgt);
        this.layoutConnection(con);
        this.sendUpdates(con,src,tgt);
        this.moveElements([con,src,tgt], {x:0,y:0});
        return con;
    }

    /**
     * Removes a constraint from the source of the constraint.
     * @param {*} constraint 
     * @property {Fact} constraint.src
     */
    removeConstraint(constraint){
        let src = constraint.src;
        src.removeUniqueness(constraint);
        src.update();
        this.removeElements([ constraint ]);
        this.sendUpdate(src);
        this.sendUpdates(...src.uniqueness, ...src.constraints);
    }

    removeAllValueConstraint(shape){
        if (shape && shape.constraints) {
            let valueConstraint; 
            for (let con of shape.constraints) {
                if (con.type === VALUE_CONSTRAINT_TYPE) {
                    valueConstraint = con;
                    break;
                }
            }
            if (valueConstraint) {
                this.removeElements([valueConstraint]);
            }
            shape.constraints = shape.constraints.filter(
                con => con.type !== VALUE_CONSTRAINT_TYPE
            );
            this.sendUpdate(shape);
        }
    }

    removeValueConstraint(constraint){
        if (isValueConstraint(constraint)) {
            let src = constraint.source;
            src.constraints = src.constraints.filter(
                con => con.id !== constraint.id
            );
            this.removeElements([constraint]);
            this.sendUpdate(src);
        }
    }

    /**
     * Toggles the alignment of a fact between horizontal and vertical.
     * @param {Fact} fact the fact to toggle alignment for
     */
    toggleAlignment(fact){
        if (isFact(fact)){
            fact.toggleAlignment();
            fact.refreshUniquenessPositions();
            fact.update();
            this.sendUpdates(fact, ...fact.labels, 
                ...fact.uniqueness, ...fact.constraints,
            );
            if (fact.incoming){
                for(let con of fact.incoming){
                    this.layoutConnection(con);
                    // for whatever reason, the source rect for layouting is offset
                    // without a move on the source element :/
                    setTimeout( () => this.moveElements([con.source], {x: 0, y: 0}), 2);
                }
            }
        }
    }
}

OrmModelling.$inject = [
    'eventBus',
    'elementFactory',
    'commandStack',
    'canvas'
];