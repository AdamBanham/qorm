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
const ContextPadModule = require('diagram-js/lib/features/context-pad').default;
const KeyBoardModule = require('diagram-js/lib/features/keyboard').default;

// additionals modules
import gridModule from './modules/grid';
import paletteProvider from './modules/palette';
import ormFactory from './modules/elements';
import ormRenderer from './modules/render';
import ormModeling from "./modules/modeling";
import ordering from "./modules/ordering";
import ormContextPads from "./modules/contextPad";
import ormConnect from "./modules/connect";
import ormRules from "./modules/rules";
import placementService from "./modules/placement";

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
        SnappingModule,
        ContextPadModule,
        KeyBoardModule
    ];

    // additiona modules for the orm-editor
    const additionalModules = [
        ormConnect,
        ormRules,
        gridModule,
        paletteProvider,
        ormFactory,
        ormRenderer,
        ormModeling,
        ordering,
        ormContextPads,
        placementService
    ];

    var diagram =  new Diagram({
        canvas: {
            container
        },
        modules: [
            ...builtinModules,
            ...additionalModules
        ],
        'keyboard.bind' : true
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

            var fact = Object.assign(
                factory.createDummyAttributesForFacts(),
                { x: 400, y: 100,}
            );
            fact = modeling.createShape(
                fact, {x: fact.x, y:fact.y},
                canvas.getRootElement()
            );
            modeling.expandFact(fact);

            let c1 = modeling.connectToFact(fact, s1);
            let c2 = modeling.connectToFact(fact, s2);
            
            modeling.moveElements([s1,s2,fact], {x:0,y:0});
    }]);

    (diagram.get('canvas') as any).zoom('fit-viewport');

    return diagram;
}