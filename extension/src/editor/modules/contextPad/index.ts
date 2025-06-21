const provider = require("./provider.js").default;
import OrmContextPad from './pad';

export default {
    __init__ : [ "contextPadProvider", 'contextPad'],
    contextPadProvider: [ 'type', provider],
    contextPad: [ 'type' , OrmContextPad ]
};