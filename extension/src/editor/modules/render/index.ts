const render = require("./render").default;
const textRender = require("./textRender").default;

export default {
    __init__ : ['tsRenderer'],
    tsRenderer: ['type', render],
    textRenderer: ['type', textRender]
};