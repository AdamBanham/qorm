const ChangeSupportModule = require('diagram-js/lib/features/change-support').default;
const DirectEditingModule = require('diagram-js-direct-editing').default;

const editingProvider = require('./editing').default;
const ormEditingService = require('./ormEditor.js').default;

export default {
    __depends__: [
        ChangeSupportModule,
        DirectEditingModule
    ],
    __init__: [ 'directEditing', 'labelEditingProvider' ],
    directEditing: [ 'type', ormEditingService ],
    labelEditingProvider: [ 'type', editingProvider ],
};