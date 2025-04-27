import VscodeMessageHandler from "./handler";
import VscodeMessager from "./messager";

export default {
    __init__: [ 'vscodeMessageHandler', 'vscodeMessager' ],
    vscodeMessageHandler: [ 'type', VscodeMessageHandler ],
    vscodeMessager: [ 'type', VscodeMessager ]
};