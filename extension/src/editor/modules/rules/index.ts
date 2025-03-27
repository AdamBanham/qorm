const OrmRules = require('./rules.js').default;

export default {
    __init__ : [ 'ormRules' ],
    ormRules : [ 'type', OrmRules]
};