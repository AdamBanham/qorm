import Diagram from 'diagram-js/lib/Diagram';

// builtin modules
const ConnectModule = require('diagram-js/lib/features/connect').default;
const ConnectPreview = require('diagram-js/lib/features/connection-preview').default;
const CreateModule = require('diagram-js/lib/features/create').default;
const ModelingModule = require('diagram-js/lib/features/modeling').default;
const MoveCanvasModule = require('diagram-js/lib/navigation/movecanvas').default;
const MoveModule = require('diagram-js/lib/features/move').default;
const PaletteModule = require('diagram-js/lib/features/palette').default;
const ZoomScrollModule = require('diagram-js/lib/navigation/zoomscroll').default;
const SnappingModule = require('diagram-js/lib/features/snapping').default;
const LassoToolModule = require('diagram-js/lib/features/lasso-tool').default;

// additionals modules
import gridModule from './modules/grid';
import paletteProvider from './modules/palette';
import ormFactory from './modules/elements';
import ormRenderer from './modules/render';
import ormModeling from "./modules/modeling"

export default function ORMEditor(container:HTMLLIElement) : Diagram<null> {

    // const container = context.getElementById("editor");

    // default modules provided by the toolbox
    const builtinModules = [
        ConnectModule,
        ConnectPreview,
        CreateModule,
        ModelingModule,
        MoveCanvasModule,
        MoveModule,
        LassoToolModule,
        PaletteModule,
        ZoomScrollModule,
        SnappingModule
    ];

    // additiona modules for the orm-editor
    const additionalModules = [
        gridModule,
        paletteProvider,
        ormFactory,
        ormRenderer,
        ormModeling
    ];

    var diagram =  new Diagram({
        canvas: {
            container
        },
        modules: [
            ...builtinModules,
            ...additionalModules
        ],
    });

    // dummy creates to test out modules
    diagram.invoke([ 'eventBus', 'elementFactory', 'canvas', 'modeling', 
        function(events, factory, canvas, modeling) {
            var s1 = Object.assign(
                factory.createDummyAttributesForEntities("entity"),
                { x: 275, y: 100,}
            );

            s1 = modeling.createShape(
                s1, {x: s1.x, y:s1.y}, 
                canvas.getRootElement()
            );

            var s2 = Object.assign(
                factory.createDummyAttributesForEntities("value"),
                { x: 525, y: 100,}
            );
            s2 = modeling.createShape(
                s2, {x: s2.x, y:s2.y}, 
                canvas.getRootElement()
            );

            var s3 = Object.assign(
                factory.createDummyAttributesForFacts(),
                { x: 400, y: 100,}
            );
            s3 = modeling.createShape(
                s3, {x: s3.x, y:s3.y},
                canvas.getRootElement()
            );
            modeling.expandFact(s3);

            let c1 = modeling.connect(s1, s3);
            let c2 = modeling.connect(s3, s2);

            modeling.moveElements([s1,s2,s3], {x:0,y:0});
    }]);

    (diagram.get('canvas') as any).zoom('fit-viewport');

    return diagram;
}