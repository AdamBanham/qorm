const ConstraintsModule = require('./constraints').default;

export default {
    __init__: [ 'constraints' ],
    constraints: [ 'type', ConstraintsModule ]
}