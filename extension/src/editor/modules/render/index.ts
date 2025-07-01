const render = require("./render").default;
const textRender = require("./textRender").default;
import ValueRenderer from "./extensions/constraints/valueRenderer";
import UniquenessRenderer from "./extensions/constraints/uniquenessRenderer";
import FactRenderer from "./extensions/factRenderer";

export default {
    __depends__ : [
        'renderingOptions',
    ],
    __init__ : [
        'tsRenderer', 
        'valueRenderer', 'uniquenessRenderer',
        'factRenderer', 
    ],
    tsRenderer: ['type', render],
    textRenderer: ['type', textRender],
    valueRenderer: ['type', ValueRenderer],
    uniquenessRenderer: ['type', UniquenessRenderer],
    factRenderer: ['type', FactRenderer]
};