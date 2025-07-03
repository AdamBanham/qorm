const provider = require('./provider');
const SpaceTool2 = require('./spaceTool');

export default {
    __depends__: [ ],
    __init__: [ 'paletteProvider', 'spaceToolPreview', 'spaceTool' ],
    paletteProvider: [ 'type', provider.default ],
    spaceTool: ['type', SpaceTool2.default]
};