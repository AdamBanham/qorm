import {
    query as domQuery,
} from 'min-dom';

import {
    innerSVG
} from 'tiny-svg';

const renderColours = `
:root {
    --render-border-colour: #12123d;
    --render-fill-colour: #d1d1df;
    --render-label-colour: #303038;
    --render-arc-stroke: black;
    --render-fact-hover-success: hsla(143, 30%, 45%, 0.80);
    --render-fact-hover-error: hsla(0, 30%, 45%, 0.80);
    --render-simple-constraint: hsl(300, 82%, 32%);
    --render-simple-constraint-editing: hsla(147, 93%, 54%, 0.5);
    --render-simple-constraint-fail: hsla(0, 85%, 37%, 0.5);    
    --render-mandatory-role-fill: hsl(280, 49%, 32%);
    --render-madatory-role-stroke: hsl(280, 91%, 13%);
}

.fact-role {
    fill: var(--render-fill-colour);
    stroke: var(--render-border-colour);
    stroke-width: 1.5;
    cursor: pointer;
}

.fact-label {
    fill: var(--render-fill-colour);
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    font-weight: normal;
    text-anchor: middle;
    box-shadow: 1px 1px 2px var(--render-border-colour);
    text-wrap: pretty;
}


.djs-visual {
    .orm-visuals {
        .fact-role-free {
            fill: var(--render-fact-hover-success);
            transition: 0.2s;
        }
        .fact-role-filled {
            fill: var(--render-fact-hover-error);
            transition: 0.2s;
        }
    }
}
`;
const renderCSS = `
<style type="text/css"><![CDATA[
${renderColours}
]]></style>
`;

class SvgExporter {

    constructor(canvas){
        this._canvas = canvas
    }

    save(){
        var svg;
        try {        
            const contentNode = this._canvas.getActiveLayer(),
                  defsNode = domQuery(':scope > defs', this._canvas._svg);
        
            const contents = innerSVG(contentNode);
            let defs = '<defs>';
            defs = defs + ( defsNode ? innerSVG(defsNode) : '');
            defs = defs + renderCSS
            defs = defs + '</defs>'
        
            const bbox = contentNode.getBBox();
        
            svg =
              '<?xml version="1.0" encoding="utf-8"?>\n' +
              '<!-- created with the help of adam banham / http://adambanham.io -->\n' +
              '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
              '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
              'width="' + bbox.width + '" height="' + bbox.height + '" ' +
              'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
              defs + contents +
              '</svg>';
          } catch (err) {
            console.error("Unable to serialise svg :: " +
                err
            )
            return null
          }
          return svg
    }
}

export default SvgExporter