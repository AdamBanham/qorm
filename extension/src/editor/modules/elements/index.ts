const factory = require('./factory');

export default {
    __init__ : [
        'elementFactory'
    ],
    elementFactory: ['type', factory.default]
};