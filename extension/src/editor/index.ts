import Diagram from 'diagram-js';
import * as vscode from 'vscode';

// builtin modules
import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectPreview from 'diagram-js/lib/features/connection-preview'
import CreateModule from 'diagram-js/lib/features/create';
import ModelingModule from 'diagram-js/lib/features/modeling';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import MoveModule from 'diagram-js/lib/features/move';
import PaletteModule from 'diagram-js/lib/features/palette';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import SnappingModule from 'diagram-js/lib/features/snapping'

// additionals modules
import gridModule from './modules/grid';

export default function ORMEditor(container:HTMLLIElement) : Diagram {

    // const container = context.getElementById("editor");

    // default modules provided by the toolbox
    const builtinModules = [
        ConnectModule,
        ConnectPreview,
        CreateModule,
        ModelingModule,
        MoveCanvasModule,
        MoveModule,
        PaletteModule,
        ZoomScrollModule,
        SnappingModule
    ];

    // additiona modules for the orm-editor
    // const additionalModules = [
    //     // gridModule
    // ]

    var diagram =  new Diagram({
        canvas: {
            container
        },
        modules: [
            ...builtinModules,
            // ...additionalModules
        ],
    });

    // dummy creates to test out modules
    diagram.invoke([ 'eventBus', 'elementFactory', 'canvas', 'modeling', 
        function(events, factory, canvas, modeling) {
            var s1 = { id: "foo-1",
             x: 300, y: 100, width: 100, height: 75};
            var s3 = { id: "foo-2",
             x: 300, y: 300, width: 100, height: 75}
            var s2 = { id: "foo-3",
             x: 300, y: 500, width: 100, height: 75};
            s1 = factory.create('shape', s1);
            s3 = factory.create('shape', s3);
            s2 = factory.create('shape', s2);
            modeling.createShape(
            s1, {x: s1.x, y:s1.y}, canvas.getRootElement()
            );
            modeling.createShape(
            s2, {x: s2.x, y:s2.y}, canvas.getRootElement()
            );
            modeling.createShape(
            s3, {x: s3.x, y:s3.y}, canvas.getRootElement()
            );

            modeling.moveElements([s1,s2,s3], {x:0,y:0});
    }]);

    (diagram.get('canvas') as any).zoom('fit-viewport');

    return diagram;
}