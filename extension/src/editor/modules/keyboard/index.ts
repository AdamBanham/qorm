const OrmShortcuts = require("./ormShortcuts.js").default;
const ormKeyboardHelp = require("./helpProvider.js").default;

export default {
    __depends__ : ['keyboard', 'selection'],
    __init__ : ['ormShortcuts', 'ormKeyboardHelp'],
    ormShortcuts : ['type', OrmShortcuts],
    ormKeyboardHelp : ['type', ormKeyboardHelp]
};