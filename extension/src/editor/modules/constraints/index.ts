const ConstraintsModule = require('./constraints').default;
const ConstraintsBuilderModule = require('./builder').default;
const ConstraintWatcher = require('./updater').default;

export default {
    __init__: [ 'constraints', 'constraintsBuilder', 'ConstraintWatcher' ],
    constraintsBuilder: [ 'type', ConstraintsBuilderModule ],
    constraints: [ 'type', ConstraintsModule ],
    ConstraintWatcher: [ 'type', ConstraintWatcher ]
};