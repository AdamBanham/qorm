
import  {
    isLabel, isConnection
} from "diagram-js/lib/util/ModelUtil";

import { ShapeLike, Connection } from "diagram-js/lib/model";
import { unitHeight, fact,  Fact } from "../model/facts";
import { Entity, ValueEntity, entity } from "../model/entities";
import { isFact, isEntity, isConstraint } from "../model/util";
import { constraint } from "../model/constraints";
  

export default function ContextPadProvider(
        create, elementFactory, connect, contextPad, 
        modeling, eventBus, registry, placementModule
    ) {
        this._create = create;
        this._elementFactory = elementFactory;
        this._connect = connect;
        this._modeling = modeling;
        this._eventBus = eventBus;
        this._registry = registry;
        this._placement = placementModule;
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
        'placementModule'

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
        that._connect.start(event, element, true);
    };

    /**
     * Expands the fact with a new role.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact the fact to expand 
     */
    ContextPadProvider.prototype.expandFact = function(that, fact){
        that._modeling.expandFact(fact);
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
    };

    /**
     * Triggers the creation of a constraint for the given fact.
     * @param {ContextPadProvider} that 
     * @param {Fact} fact 
     */
    ContextPadProvider.prototype.createConstraint = function(that, fact, event){
        that._eventBus.fire('fact.create.constraint', 
            {fact: fact, mode: 'simple', originalEvent: event}
        );
    };

    /**
     * Builds the current context options from the state of the fact
     * @param {fact} fact 
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

        options['make-contraint'] = {
            action: {
                click: (event) => {that.createConstraint(that, fact, event);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-minus mdi editor-hover"/>',
            title: 'Add Constraint',
            group: '2-edit'
        };

        options['delete'] = {
            action: {
                click: () => {that.removeElement(that, fact);},
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
        var fact = con.target;
        var entity = con.source;
        fact.clearRole(entity,con.role);
        that._modeling.removeElements([ con ]);
        that._modeling.sendUpdates(fact, entity);
    };

    /**
     * Flips the mandatory role that this connection plays, i.e. the entity must
     * play a role in the connected fact type.
     * @param {ContextPadProvider} that 
     * @param {Connection} con the connection to make mandatory
     */
    ContextPadProvider.prototype.makeMandatory = function(that, con){
        that._modeling.flipMandatoryConstraint(con);
        that._modeling.sendUpdate(con)
    }

    /**
     * Builds the current context options from the state of the connection
     * @param {Connection} con the selected connection
     * @returns the options 
     */
    ContextPadProvider.prototype.getConnectionOptions = function(con){
        var that = this;
        var options = {};

        let offMandatory = "circle-off-outline"
        let onMandatory = "circle"
        let included = con.mandatory ? offMandatory : onMandatory

        options['mandatory'] = {
            action : {
                click: () => {that.makeMandatory(that, con)}
            },
            className: 'context-pad-mandatory',
            html: '<div class="entry mdi-'+included +' mdi editor-hover"/>',
            title: 'Flip Mandatory?',
            group: 'edit'
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
            html: '<div class="entry mdi-arrow-right-thick mdi editor-hover"/>',
            title: 'Connect',
            group: 'join'
        };

        options['flip-entity-type'] = {
            action: {
                click: () => {that.flipEntity(that, entity);},
            },
            className: 'context-pad-flip',
            html: '<div class="entry mdi mdi-orbit-variant editor-hover"/>',
            title: 'Flip',
            group: 'edit'
        };
        
        options['create-fact'] = {
            action: {
                click: () => {that.createConnectedFact(that, entity);},
            },
            class: 'context-pad-create-fact',
            html: '<div class="entry mdi mdi-alpha-f-box-outline editor-hover"/>',
            title: 'Join to Fact',
            group: 'add'
        };

        options['delete'] = {
            action: {
                click: () => {that.removeElement(that, entity);},
            },
            className: 'context-pad-delete',
            html: '<div class="entry mdi-delete mdi editor-hover"/>',
            title: 'Delete',
            group: 'edit'
        };

        return options;
    };

    /**
     * Removes the given constraint from the schema.
     * @param {ContextPadProvider} that 
     * @param {constraint} constraint the constraint to remove
     */
    ContextPadProvider.prototype.removeConstraint = function(that, constraint){
        let src = constraint.src;
        constraint.src.removeConstraint(constraint);
        that._modeling.removeElements([ constraint ]);
        that._modeling.sendUpdate(src);
        that._modeling.sendUpdates(...src.constraints);
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