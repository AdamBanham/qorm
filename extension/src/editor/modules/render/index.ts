const render = require("./render").default;
const textRender = require("./textRender").default;
import ValueRenderer from "./extensions/constraints/valueRenderer";

export default {
    __init__ : ['tsRenderer', 'valueRenderer'],
    tsRenderer: ['type', render],
    textRenderer: ['type', textRender],
    valueRenderer: ['type', ValueRenderer],
};