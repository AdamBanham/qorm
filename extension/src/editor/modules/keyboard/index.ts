const OrmShortcuts = require("./ormShortcuts.js").default;

export default {
    __depends__ : ['keyboard', 'selection'],
    __init__ : ['OrmShortcuts'],
    OrmShortcuts : ['type', OrmShortcuts]
}