
export const CONSTANTS = {
    NO_HIT_CLASS : "djs-hit-no-move",
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
    strokeWidth: 3, stroke: CONSTANTS.ARC_STROKE_COLOUR, 
    strokeLinecap: 'round',
    strokeLinejoin: 'round', fill: 'none'
};

export default CONSTANTS;