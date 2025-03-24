const provider = require('./provider');

export default {
    __depends__: [  ],
    __init__: [ 'paletteProvider' ],
    paletteProvider: [ 'type', provider.default ]
};