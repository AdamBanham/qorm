import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import EventBus from 'diagram-js/lib/core/EventBus';
import Rules from 'diagram-js/lib/features/rules/Rules';
import { isEntity, isFact } from '../model/util';

const DEFAULT_PRIORITY = 1000;

/**
 * 
 */
export default class OrmRules extends RuleProvider{
    
    /**
     * 
     * @param {EventBus} eventBus 
     * @param {Rules} rules 
     */
    constructor(eventBus, rules){
        super(eventBus);
        this._rules = rules;
        this.addConnectionRules();
        this.addEntityRules();
        this.addFactRules();
    }

    /**
     * Add the rules for valid and legal connections
     */
    addConnectionRules(){
        // add a rule that checks that the source is an entity and
        // the target is a fact
        this.addRule(
            'connection.create',
            DEFAULT_PRIORITY,
            function(context) {
                var source = context.source,
                    target = context.target,
                    role = context.role;
                if (isEntity(source) && isFact(target)){
                    if (!target.hasMissingRole()){
                        return false;
                    } else {
                        return !target.isFilled(role);
                    }
                }
                return false;
            }
        );
    }

    /**
     * 
     */
    addEntityRules(){

    }

    /**
     * 
     */
    addFactRules(){
    
    }

}

OrmRules.$inject = ['eventBus', 'rules'];
