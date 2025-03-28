const placementModule = require('./placer.js').default;

export default {
    __init__ : [ 'placementModule' ],
    placementModule : [ 'type', placementModule]
};