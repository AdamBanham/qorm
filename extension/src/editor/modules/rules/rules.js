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
        this.addContraintRules();
    }

    checkConnectionCreation(context) {
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
        
    /**
     * Add the rules for valid and legal connections
     */
    addConnectionRules(){
        // add a rule that checks that the source is an entity and
        // the target is a fact
        var that = this;
        this.addRule(
            'connection.create',
            DEFAULT_PRIORITY,
            that.checkConnectionCreation
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
    

    checkSimpleConstraintCreation(context) {
        var fact = context.fact,
            constraint = context.constraint;

        return constraint.over.length > fact.roles - 1;
    }

    handleConstraintCreation(context) {
        var mode = context.mode; 

        if (mode === 'simple') {
            return this.checkSimpleConstraintCreation(context);
        }
        console.error('Unknown constraint creation mode: ', mode);
        return false;
    }

    /**
     * Adds the rules for constraints.
     */
    addContraintRules(){
        var that = this;
        this.addRule(
            'constraint.create',
            DEFAULT_PRIORITY,
            that.handleConstraintCreation
        );
    }

}

OrmRules.$inject = ['eventBus', 'rules'];
