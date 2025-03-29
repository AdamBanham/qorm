const ChangeSupportModule = require('diagram-js/lib/features/change-support').default;
const DirectEditingModule = require('diagram-js-direct-editing').default;

const editingProvider = require('./editing').default;

export default {
    __depends__: [
        ChangeSupportModule,
        DirectEditingModule
    ],
    __init__: [ 'labelEditingProvider' ],
    labelEditingProvider: [ 'type', editingProvider ]
};