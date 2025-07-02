
export const CSS_CONSTANTS = {
    RENDER_VISUALS_CLASS : "orm-visuals",
    BORDER_COLOUR : "var(--render-border-colour)",
    SHAPE_FILL_COLOUR : "var(--render-fill-colour)",
    SHAPE_LABEL_COLOUR : "var(--render-label-colour)",
    ARC_STROKE_COLOUR : "var(--render-arc-stroke)",
    CONSTRAINT_COLOUR : "var(--render-simple-constraint)",
    CONSTRAINT_EDIT_COLOUR : "var(--render-simple-constraint-editing)",
    CONSTRAINT_EDIT_FAIL : "var(--render-simple-constraint-fail)",
    CONSTRAINT_TEXT_COLOUR : "var(--render-value-constraint-text-fill)",
    MANDATORY_ROLE_COLOUR : "var(--render-mandatory-role-fill)",
    MANDATORY_ROLE_STROKE : "var(--render-madatory-role-stroke)",
    OBJECTIFICATION_FILL_COLOUR : "var(--render-objectification-fill)",
    OBJECTIFICATION_RECT_CLASS : "fact-objectified",
};

export const CONNECTION_STYLE = {
    strokeWidth: 3, stroke: CSS_CONSTANTS.ARC_STROKE_COLOUR, 
    strokeLinecap: 'round',
    strokeLinejoin: 'round', fill: 'none'
};

export const SUBTYPE_STYLE = {
    strokeWidth: 5, stroke: CSS_CONSTANTS.MANDATORY_ROLE_STROKE, 
    strokeLinecap: 'round',
    strokeLinejoin: 'round', fill: 'none'
};

export const CONNECTION_OPTIONS = {
    roundingRadius: 7.5
};

export const VISUAL_GROUP_CLASS = "orm-visuals";

export const CLASS_CONSTANTS = {
    VISUAL_GROUP_CLASS,
    NO_HIT_CLASS : "djs-hit-no-move",
    FACT_ROLE_CLASS: "fact-role",
    FACT_VERB_ARROW_CLASS: "fact-verb-arrow",
    FACT_ROLE_FREE_CLASS: "fact-role-free",
    FACT_ROLE_FILLED_CLASS: "fact-role-filled",
    OBJECTIFICATION_RECT_CLASS: "fact-objectified",
    OBJECTIFICATION_LABEL_CLASS: "fact-objectified-label"
};

export default {
    css : CSS_CONSTANTS,
    classes : CLASS_CONSTANTS,
    connection: CONNECTION_OPTIONS,
};