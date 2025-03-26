const provider = require("./provider.js").default;

export default {
    __init__ : [ "contextPadProvider"],
    contextPadProvider: [ 'type', provider]
}