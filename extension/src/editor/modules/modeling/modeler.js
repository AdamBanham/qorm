import Modeling from 'diagram-js/lib/features/Modeling/Modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';

import { Fact } from "../model/facts"
import { entity } from "../model/entities"

export default class OrmModelling extends Modeling {

    /**
     * 
     * @param {EventBus} eventBus 
     * @param {ElementFactory} elementFactory 
     * @param {CommandStack} commandStack 
     */
    constructor(eventBus, elementFactory, commandStack){
        super(eventBus, elementFactory, commandStack)
    }

    /**
     * 
     * @param {Fact} fact 
     * @param {entity}
     */
    expandFact(fact, entity){
        fact.addRole()
        if (entity){
            fact.setRole(entity, fact.roles)
        }
        // TODO: send the event for element changed.
    }
}