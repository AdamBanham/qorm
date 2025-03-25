const OrmModeling = require('./modeler.js').default;

export default {
    __init__ : [
        'modeling'
    ],
    modeling: ['type', OrmModeling]
};