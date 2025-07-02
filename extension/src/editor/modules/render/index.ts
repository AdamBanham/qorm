const render = require("./render").default;
const textRender = require("./textRender").default;
import ValueRenderer from "./extensions/constraints/valueRenderer";
import UniquenessRenderer from "./extensions/constraints/uniquenessRenderer";
import FactRenderer from "./extensions/factRenderer";
import ReferencedEntityRenderer from "./extensions/referencedEntityRenderer";
import ValueEntityRenderer from "./extensions/valueEntityRenderer";
import RoleConnectionRenderer from "./extensions/connections/roleConnectionRenderer";
import SubtypeConnectionRenderer from "./extensions/connections/subtypeConnectionRenderer";
import ObjectificationRenderer from "./extensions/objectificationRenderer";
import LabelRenderer from "./extensions/labelRenderer";

export default {
    __depends__ : [
        'renderingOptions',
    ],
    __init__ : [
        'tsRenderer', 
        'valueRenderer', 'uniquenessRenderer',
        'factRenderer', 'referencedEntityRenderer',
        'valueEntityRenderer', 'roleConnectionRenderer',
        'subtypeConnectionRenderer', 'objectificationRenderer',
        'labelRenderer'
    ],
    tsRenderer: ['type', render],
    textRenderer: ['type', textRender],
    valueRenderer: ['type', ValueRenderer],
    uniquenessRenderer: ['type', UniquenessRenderer],
    factRenderer: ['type', FactRenderer],
    referencedEntityRenderer: ['type', ReferencedEntityRenderer],
    valueEntityRenderer : [ 'type', ValueEntityRenderer ],
    roleConnectionRenderer : ['type', RoleConnectionRenderer],
    subtypeConnectionRenderer : ['type', SubtypeConnectionRenderer],
    objectificationRenderer: ['type', ObjectificationRenderer],
    labelRenderer: ['type', LabelRenderer]

};