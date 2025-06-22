
import  {
    isLabel, isConnection
} from "diagram-js/lib/util/ModelUtil";

import { ShapeLike, Connection } from "diagram-js/lib/model";
import { unitHeight, fact,  Fact } from "../model/facts";
import { Entity, ValueEntity, entity } from "../model/entities";
import { isFact, isEntity, isConstraint, isExactlyEntity, } from "../model/util";
import { isSubtype, isObjectification } from "../model/util";
import { constraint } from "../model/constraints";
import { BUS_TRIGGER as CONSTRAINT_BUS_TRIGGER,
         SIMPLE_MODE as CONSTRAINT_SIMPLE_MODE,
         OBJECT_VALUE_MODE as CONSTRAINT_VALUE_MODE,
         ROLE_VALUE_MODE as CONSTRAINT_ROLE_VALUE_MODE
} from "../constraints/constraints";
import { isValueConstraint } from "../constraints/model/utils";
  

export default function ContextPadProvider(
        create, elementFactory, connect, contextPad, 
        modeling, eventBus, registry, placementModule,
        subtyping
    ) {
        this._create = create;
        this._elementFactory = elementFactory;
        this._connect = connect;
        this._modeling = modeling;
        this._eventBus = eventBus;
        this._registry = registry;
        this._placement = placementModule;
        this._subtyping = subtyping;
        this._pad = contextPad;
        contextPad.registerProvider(this);
    }

    ContextPadProvider.$inject = [
        'create',
        'elementFactory',
        'ormConnect',
        'contextPad',
        'modeling',
        'eventBus',
        'elementRegistry',
        'placementModule',
        'ormSubtyping'

    ];

    /**
     * Generates the suitable options to show in the context pad for the given element.
     * @param {Connection | Fact | Entity | ValueEntity } element 
     * @returns {Object} the options to show in the context pad
     */
    ContextPadProvider.prototype.getContextPadEntries = function(element){
        var options = {};
        
        if (isConnection(element)){
            options = this.getConnectionOptions(element);
        }    
        if (isFact(element)){
            options = this.getFactOptions(element);
        }
        if (isEntity(element)){
            options = this.getEntityOptions(element);
        }
        if (isConstraint(element)){
            options = this.getConstraintOptions(element);
        }
        if (isObjectification(element)){
            options = this.getObjectificationOptions(element);
        }
        if (isValueConstraint(element)){
            options = this.getValueConstraintOptions(element);
        }
        return options;
    };

    /**
     * Removes the element from the orm schema.
     * @param {ContextPadProvider} that 
     * @param {fact | entity | ShapeLike} element
     */
    ContextPadProvider.prototype.removeElement = function(that, element) {
        that._modeling.removeElements([ element ]);
    };

    /**
     * Starts a connection attempt from the given element
     * @param {ContextPadProvider} that 
     * @param {Fact | Entity | ValueEntity | ShapeLike } element 
     * @param {*} event 
     */
    ContextPadProvider.prototype.startConnect = function(that, element, event){
        that._connect.start(event, element);
    };

    /**
     * Expands the fact with a new role.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact the fact to expand 
     */
    ContextPadProvider.prototype.expandFact = function(that, fact){
        that._modeling.expandFact(fact);
        that._pad.open(fact, true);
    };

    /**
     * Reduces the number of roles in the fact.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact the fact to reduce
     */
    ContextPadProvider.prototype.reduceFact = function(that, fact){
        if (fact.roles > 1){
            that._modeling.reduceFact(fact);
        }
        that._pad.open(fact, true);
    };

    /**
     * Triggers the creation of a constraint for the given fact.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.createConstraint = function(that, fact, event){
        that._eventBus.fire(CONSTRAINT_BUS_TRIGGER, 
            {source: fact, mode: CONSTRAINT_SIMPLE_MODE, originalEvent: event}
        );
    };

    /**
     * Triggers objectification of the fact, i.e. relation is has a referenced
     * entity.
     * @param {ContextPadProvider} that
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.objectifyFact = function(that, fact){
        that._modeling.flipObjectification(fact);
        that._pad.open(fact, true);
    };

    /**
     * Triggers de-objectification of the fact
     * @param {ContextPadProvider} that
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.deobjectifyFact = function(that, fact){
        that._modeling.flipObjectification(fact);
        that._pad.open(fact, true);
    };

    /**
     * Flips the derviation state of the fact.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.derived = function(that, fact){
        that._modeling.flipDerivation(fact);
        that._pad.open(fact, true);
    };

    /**
     * 
     * @param {ContextPadProvider} that 
     * @param {Fact} fact 
     * @param {"left" | "right"} direction 
     */
    ContextPadProvider.prototype.towards = function(that, fact, direction){
        if (direction){
            fact.setTowards(direction);
        } else  {
            fact.unsetTowards();
        }
        that._modeling.sendUpdate(fact);
    }

    /**
     * Removes the fact from the current ORM schema.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.removeFact = function(that, fact){
        that._modeling.removeFact(fact);
    };

    ContextPadProvider.prototype.createValueConstraint = function(that, fact, event){
        that._eventBus.fire(CONSTRAINT_BUS_TRIGGER, 
            {source: fact, mode: CONSTRAINT_ROLE_VALUE_MODE, originalEvent: event}
        );
    };

    /**
     * Builds the current context options from the state of the fact
     * @param {Fact} fact 
     * @returns the options 
     */
    ContextPadProvider.prototype.getFactOptions = function(fact){
        var that = this;
        
        var options = {};

       
        options['expand'] = {
            action : {
                click : () => {that.expandFact(that, fact);}
            },
            className: 'content-pad-fact-expand',
            html: '<div class="entry mdi-plus-box-outline mdi editor-hover" />',
            title: 'Expand',
            group: '1-grow'
        };

        if (fact.roles > 1){
            options['reduce'] = {
                action : {
                    click : () => {that.reduceFact(that, fact);}
                },
                className: 'content-pad-fact-reduce',
                html: '<div class="entry mdi-minus-box-outline mdi editor-hover" />',
                title: 'Reduce',
                group: '1-grow'
            };
    
        }

        if (fact.derived) {
            options['remove-derived'] = {
                action: {
                    click: () => {that.derived(that, fact);},
                },
                className: 'context-pad-derived',
                html: '<div class="entry mdi mdi-alpha-d-box editor-hover"/>',
                title: 'Remove Derivation',
                group: '2-edit'
            };
        } else {
            options['make-derived'] = {
                action: {
                    click: () => {that.derived(that, fact);},
                },
                className: 'context-pad-derived',
                html: '<div class="entry mdi mdi-alpha-d-box-outline editor-hover"/>',
                title: 'Add Derivation',
                group: '2-edit'
            };
        }

        if (fact.roles > 1){

            if (fact.towards !== 'left'){
                options['towards-left'] = {
                    action: {
                        click: () => {that.towards(that, fact, 'left');},
                    },
                    className: 'context-pad-towards-left',
                    html: '<div class="entry mdi mdi-alpha-l-box-outline editor-hover"/>',
                    title: 'Towards Left',
                    group: '2-edit'
                };
            }

            if (fact.towards !== 'right'){
                options['towards-right'] = {
                    action: {
                        click: () => {that.towards(that, fact, 'right');},
                    },
                    className: 'context-pad-towards-right',
                    html: '<div class="entry mdi mdi-alpha-r-box-outline editor-hover"/>',
                    title: 'Towards Right',
                    group: '2-edit'
                };
            }
        }

        if (fact.isTowards()) {
            options['unset-towards'] = {
                action: {
                    click: () => {that.towards(that, fact);},
                },
                className: 'context-pad-towards-none',
                html: '<div class="entry mdi mdi-alpha-n-box-outline editor-hover"/>',
                title: 'No Direction',
                group: '2-edit'
            };
        }

        options['make-contraint'] = {
            action: {
                click: (event) => {that.createConstraint(that, fact, event);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-alpha-c-box-outline mdi editor-hover"/>',
            title: 'Add Constraint',
            group: '3-edit'
        };

        options['create-value-constraint'] = {
            action: {
                click: (event) => {that.createValueConstraint(that, fact, event);},
            },
            className: 'context-pad-create-value-constraint',
            html: '<div class="entry mdi mdi-alpha-v-box-outline editor-hover"/>',
            title: 'Add Value Constraint',
            group: '3-edit'
        };

        if (!fact.objectified){
            options['objectify'] = {
                action: {
                    click: () => {that.objectifyFact(that, fact);},
                },
                className: 'context-pad-objectify',
                html: '<div class="entry mdi mdi-alpha-o-box-outline editor-hover"/>',
                title: 'Objectify',
                group: '2-edit'
            };
        } else {
            options['de-objectify'] = {
                action: {
                    click: () => {that.deobjectifyFact(that, fact);},
                },
                className: 'context-pad-objectify',
                html: '<div class="entry mdi mdi-alpha-o-box editor-hover"/>',
                title: 'De-Objectify',
                group: '2-edit'
            };
        }

        options['delete'] = {
            action: {
                click: () => {that.removeFact(that, fact);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: '3-delete'
        };

        return options;
    };


    /**
     * Removes a connection from the orm schema, updating the fact and entity.
     * @param {ContextPadProvider} that 
     * @param {Connection} con the connection to remove.
     */
    ContextPadProvider.prototype.removeConnection = function(that, con){
        that._modeling.removeConnection(con);
    };

    /**
     * Flips the mandatory role that this connection plays, i.e. the entity must
     * play a role in the connected fact type.
     * @param {ContextPadProvider} that 
     * @param {Connection} con the connection to make mandatory
     */
    ContextPadProvider.prototype.makeMandatory = function(that, con){
        that._modeling.flipMandatoryConstraint(con);
        that._modeling.sendUpdate(con);
    };

    /**
     * Builds the current context options from the state of the connection
     * @param {Connection} con the selected connection
     * @returns the options 
     */
    ContextPadProvider.prototype.getConnectionOptions = function(con){
        var that = this;
        var options = {};

        let offMandatory = "alpha-m-box-outline";
        let onMandatory = "alpha-m-box";
        let included = con.mandatory ? onMandatory : offMandatory;

        if (isSubtype(con)){
            // TODO: add the subtype connection options
           
        } else {
             options['mandatory'] = {
                action : {
                    click: () => {that.makeMandatory(that, con);}
                },
                className: 'context-pad-mandatory',
                html: '<div class="entry mdi-'+included +' mdi editor-hover"/>',
                title: 'Flip Mandatory?',
                group: 'edit'
            };
        }

        options['delete'] = {
            action: {
                click: () => {that.removeConnection(that, con);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'edit'
        };

        return options;
    };

    /**
     * Creates a new fact connected to the given entity type.
     * @param {ContextPadProvider} that click event data.
     * @param {Entity | ValueEntity} element the source entity
     */
    ContextPadProvider.prototype.createConnectedFact = function (that, element){
        var fact = Object.assign(
            that._elementFactory.createDummyAttributesForFacts(),
            { x: element.x+element.width+ 100, 
              y: element.y+element.height/2,}
        );
        fact = that._modeling.createShape(
            fact, {x: fact.x, y:fact.y}, 
            element.parent
        );
        // find a free position
        let pos = that._placement.place(element, fact);
        fact.x = pos.x;
        fact.y = pos.y;
        // add entity as a role to the fact
        let con = that._modeling.connectToFact(fact, element, 0);
        // silly updating to make sure the layering is correct
        // that._modeling.moveElements([con,element,fact], {x:0,y:0});
        that._modeling.sendUpdates(con,fact,element);
    };

    /**
     * Flips the type of the entity.
     * @param {ContextPadProvider} that 
     * @param {Entity | ValueEntity} entity the entity to flip
     */
    ContextPadProvider.prototype.flipEntity = function(that, entity){
        entity.flipType();
        that._modeling.sendUpdate(entity);
        that._pad.open(entity, true);
    };

    /**
     * Flips the label reference mode of the entity.
     * @param {ContextPadProvider} that 
     * @param {Entity} entity 
     */
    ContextPadProvider.prototype.flipReferenceMode = function(that, entity){
        entity.flipReferenceMode();
        that._modeling.sendUpdate(entity);
    };

    /**
     * Triggers connection for subtyping for a given entity
     * @param {ContextPadProvider} that 
     * @param {object} event the triggering event
     * @param {Entity} entity the source of the subtyping 
     */
    ContextPadProvider.prototype.addSubtyping = function(that, event, entity){
        // TODO: trigger connect for subtyping
        that._subtyping.start(event, entity);
    };

    ContextPadProvider.prototype.addValueConstraint = function(that, entity){
        that._eventBus.fire(CONSTRAINT_BUS_TRIGGER, 
            {source: entity, mode: CONSTRAINT_VALUE_MODE, originalEvent: event}
        );
    };

    ContextPadProvider.prototype.removeAllValueConstraints = function(that, entity){
        that._modeling.removeAllValueConstraint(entity);
        that._pad.open(entity, true);
    };


    /**
     * Creates the usable options for the given Entity type.
     * @param {Entity} entity 
     * @returns {object} the options for the entity
     */
    ContextPadProvider.prototype.getEntityOptions = function(entity){
        var that = this;
        var options = {};

        options['connect'] = {
            action: {
                click: (event,) => {that.startConnect(that,entity, event,);},
                dragstart: (event,) => {that.startConnect(that,entity, event,);}
            },
            className: 'context-pad-contect',
            html: '<div class="entry mdi-alpha-c-box-outline mdi editor-hover"/>',
            title: 'Connect',
            group: 'join'
        };

        if (!entity.isSubtyping()){
            options['flip-entity-type'] = {
                action: {
                    click: () => {that.flipEntity(that, entity);},
                },
                className: 'context-pad-flip',
                html: '<div class="entry mdi mdi-alpha-t-box-outline editor-hover"/>',
                title: 'Flip Type',
                group: 'edit'
            };
        }

        if (isExactlyEntity(entity)){
            
            options['flip-reference-type'] = {
                action: {
                    click: () => {that.flipReferenceMode(that, entity);},
                },
                className: 'context-pad-flip-ref',
                html: '<div class="entry mdi mdi-alpha-r-box-outline editor-hover"/>',
                title: 'Flip Label Reference',
                group: 'edit'
            };
            options['subtype'] = {
                action : {
                    click: (event) => {that.addSubtyping(that, event, entity);}
                },
                className: 'context-pad-subtyping',
                html: '<div class="entry mdi mdi-alpha-s-box-outline editor-hover"/>',
                title: 'Subtype of',
                group: 'join'
            };
        }
        
        options['create-fact'] = {
            action: {
                click: () => {that.createConnectedFact(that, entity);},
            },
            class: 'context-pad-create-fact',
            html: '<div class="entry mdi mdi-alpha-f-box-outline editor-hover"/>',
            title: 'Join to Fact',
            group: 'add'
        };

        if (entity.hasValueConstraint()){
            options['remove-value-constraint'] = {
                action: {
                    click: () => {that.removeAllValueConstraints(that, entity);},
                },
                className: 'context-pad-add-value-constraint',
                html: '<div class="entry mdi mdi-alpha-v-box editor-hover"/>',
                title: 'Remove Value Constraint',
                group: 'add'
            };
        } else {
            options['add-value-constraint'] = {
                action: {
                    click: () => {that.addValueConstraint(that, entity);},
                },
                className: 'context-pad-add-value-constraint',
                html: '<div class="entry mdi mdi-alpha-v-box-outline editor-hover"/>',
                title: 'Add Value Constraint',
                group: 'add'
            };
        }

        options['delete'] = {
            action: {
                click: () => {that.removeElement(that, entity);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'del'
        };

        return options;
    };

    /**
     * Removes the given constraint from the schema.
     * @param {ContextPadProvider} that 
     * @param {constraint} constraint the constraint to remove
     */
    ContextPadProvider.prototype.removeConstraint = function(that, constraint){
        that._modeling.removeConstraint(constraint);
    };

    /**
     * Creates the usable options for the given constraint type.
     * @param {constraint} constraint 
     * @returns 
     */
    ContextPadProvider.prototype.getConstraintOptions = function(constraint){
        var that = this;
        var options = {};

        options['delete'] = {
            action: {
                click: () => {that.removeConstraint(that, constraint);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'edit'
        };

        return options;
    };


    ContextPadProvider.prototype.getObjectificationOptions = function(objectification){
        var that = this;
        var options = {};

        options['connect'] = {
            action: {
                click: (event,) => {that.startConnect(that, objectification, event,);},
                dragstart: (event,) => {that.startConnect(that, objectification, event,);}
            },
            className: 'context-pad-contect',
            html: '<div class="entry mdi-alpha-c-box-outline mdi editor-hover"/>',
            title: 'Connect',
            group: 'join'
        };

        options['create-fact'] = {
            action: {
                click: () => {that.createConnectedFact(that, objectification);},
            },
            class: 'context-pad-create-fact',
            html: '<div class="entry mdi mdi-alpha-f-box-outline editor-hover"/>',
            title: 'Join to Fact',
            group: 'add'
        };

        options['delete'] = {
            action: {
                click: () => {that.objectifyFact(that, objectification.fact);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'edit'
        };

        return options;
    };

    ContextPadProvider.prototype.increaseWidthOnValueConstraint = function(that, constraint){
        constraint.increaseWidth();
        that._modeling.sendUpdate(constraint);
    };

    ContextPadProvider.prototype.decreaseWidthOnValueConstraint = function(that, constraint){
        constraint.decreaseWidth();
        that._modeling.sendUpdate(constraint);
    };

    ContextPadProvider.prototype.removeValueConstraint = function(that, constraint){
        let src = constraint.source;
        that._modeling.removeValueConstraint(constraint);
        that._pad.open(src, true);
    };

    ContextPadProvider.prototype.getValueConstraintOptions = function(constraint){
        let options = {};

        options['increase-width'] = {
            action: {
                click: () => {this.increaseWidthOnValueConstraint(this, constraint);}
            },
            className: 'context-pad-increase-width',
            html: '<div class="entry mdi mdi-plus-box-outline editor-hover"/>',
            title: 'Increase Width',
            group: 'edit'
        };

        if (constraint.canDecreaseWidth()){ 
            options['decrease-width'] = {
                action: {
                    click: () => {this.decreaseWidthOnValueConstraint(this, constraint);}
                },
                className: 'context-pad-decrease-width',
                html: '<div class="entry mdi mdi-minus-box-outline editor-hover"/>',
                title: 'Decrease Width',
                group: 'edit'
            };
        }

        options['delete'] = {
            action: {
                click: () => {this.removeValueConstraint(this, constraint);}
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'edit'
        };

        return options;
    };