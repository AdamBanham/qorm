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
     * 
     */
    addConnectionRules(){
        // add a rule that checks that the source is an entity and
        // the target is a fact
        this.addRule(
            'connection.create',
            DEFAULT_PRIORITY,
            function(context) {
                var source = context.source,
                    target = context.target;
                let itern = isEntity(source) && isFact(target);
                if (itern){
                    return target.hasMissingRole();
                }
                return itern;
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
