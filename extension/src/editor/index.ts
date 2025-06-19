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
const LabelSupportModule = require('diagram-js/lib/features/label-support').default;
const BendpointsModule = require('diagram-js/lib/features/bendpoints').default;
const SelectionModule = require('diagram-js/lib/features/selection').default;

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
import ormInteractions from "./modules/interactions";   
import ormLayouter from "./modules/layout";
import ormLabelEditing from "./modules/labels";
import customBendpoints from "./modules/bendpoints";
import ormConstraints from "./modules/constraints";
import ormKeyboard from "./modules/keyboard";
import ormVscodeHandler from "./modules/vscode";
import ormDragging from "./modules/dragging";
import ormObjectification from "./modules/objectification";
import ormMoving from "./modules/move";

export default function ORMEditor(container:HTMLLIElement) : 
    Diagram<null> {

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
        KeyBoardModule,
        LabelSupportModule,
        BendpointsModule,
        SelectionModule
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
        placementService,
        ormInteractions,
        ormLayouter,
        ormLabelEditing,
        customBendpoints,
        ormConstraints,
        ormKeyboard,
        ormVscodeHandler,
        ormDragging,
        ormObjectification,
        ormMoving
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

    setTimeout(
        () => {
            (diagram.get('canvas') as any).zoom('fit-viewport');
        }, 50
    );

    return diagram;
}