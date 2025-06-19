import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import EventBus from 'diagram-js/lib/core/EventBus';
import Rules from 'diagram-js/lib/features/rules/Rules';
import { isEntity, isExactlyEntity, isFact, isObjectification } from '../model/util';

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
        if ((isEntity(source) || isObjectification(source)) && isFact(target)){
            if (!target.hasMissingRole()){
                return false;
            } else {
                return !target.isFilled(role);
            }
        }
        return false;
    }

    /**
     * Checks whether the subtype connection is valid
     * @param {context.source} source the source of the connection
     * @param {context.target} target the target of the connection 
     * @return {boolean} whether the subtyping is valid
     */
    checkSubtypeCreation(context) {
        var src = context.source;
        var tgt = context.target;
        // check if the src is already a subtype of the tgt
        if (src.isSubtypeOf(tgt)){
            return false;
        }
        if (isExactlyEntity(src) && isExactlyEntity(tgt)){
            return isEntity(src) && isEntity(tgt) && src.id !== tgt.id;
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
        this.addRule(
            'subtype.create',
            DEFAULT_PRIORITY,
            that.checkSubtypeCreation
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

        if (constraint.editing){
            constraint.valid = constraint.over.length >= fact.roles - 1;
        }

        return constraint.over.length >= fact.roles - 1;
    }

    handleConstraintCreation(context, that) {
        var mode = context.mode; 

        if (mode === 'simple') {
            return that.checkSimpleConstraintCreation(context);
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
            (context) => {
                return that.handleConstraintCreation(context,that);
            }
        );
    }

}

OrmRules.$inject = ['eventBus', 'rules'];
