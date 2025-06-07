import SvgExporter from "../exporters/svgExporter";

export default function ExamplePaletteProvider(
    create, elementFactory, lassoTool, palette, connect, registry,
    modeling, canvas, eventBus, vscodeMessager) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._lassoTool = lassoTool;
    this._palette = palette;
    this._connect = connect;
    this._registry = registry;
    this._modeling = modeling;
    this._canvas = canvas;
    this._bus = eventBus;
    this._vscodeMessager = vscodeMessager;
  
    palette.registerProvider(this);
  }
  
  ExamplePaletteProvider.$inject = [
    'create',
    'elementFactory',
    'lassoTool',
    'palette',
    'ormConnect',
    'elementRegistry',
    'modeling',
    'canvas',
    'eventBus',
    'vscodeMessager'
  ];
  
  
  ExamplePaletteProvider.prototype.getPaletteEntries = function() {
    var create = this._create,
        factory = this._elementFactory,
        lassoTool = this._lassoTool,
        registry = this._registry,
        modeling = this._modeling,
        canvas = this._canvas,
        bus = this._bus,
        vscodeMessager = this._vscodeMessager;
  
    return {
      'lasso-tool': {
        group: 'tools',
        className: 'mdi-lasso mdi',
        title: 'Activate Lasso Tool',
        action: {
          click: function(event) {
            lassoTool.activateSelection(event);
          }
        }
      },
      'tool-separator': {
        group: 'tools',
        separator: true
      },
      'create-entity': {
        group: 'create',
        className: 'mdi-alpha-e-box-outline mdi',
        title: 'Create Entity Type',
        action: {
          click: function(event) {
            var s = Object.assign(
              factory.createDummyAttributesForEntities("entity"),
              { x: 200, y: 100,}
            );
            create.start(event, s);
          }
        }
      },
      'create-value': {
        group: 'create',
        className: 'mdi-alpha-v-box-outline mdi',
        title: 'Create Value Type',
        action: {
          click: function(event) {
            var s = Object.assign(
              factory.createDummyAttributesForEntities("value"),
              { x: 200, y: 100,}
            );

            create.start(event, s);
          }
        }
      },
      'create-fact': {
        group: 'create',
        className: 'mdi-alpha-f-box-outline mdi',
        title: 'Create Fact type',
        action: {
          click: function(event) {
            var s = Object.assign(
              factory.createDummyAttributesForFacts(),
              { x: 200, y: 100,}
            );

            create.start(event, s);
          }
        }
      },
      'create-separator': {
        group: 'create',
        separator: true
      },
      'save': {
        group: 'model',
        className: 'mdi-content-save-outline mdi',
        title: 'Save Schema',
        action: {
          click: function(event) {
            vscodeMessager.sendDocumentSave();
          }
        }
      },
      'export-svg': {
        group: 'model',
        className: 'mdi-export mdi',
        title: 'Export SVG',
        action: {
          click: function(event) {
            // Generate the content you want to download as a string
            const content = new SvgExporter(canvas).save()

            // Create a Blob (Binary Large Object) from the content
            const blob = new Blob([content], { type: 'text/plain' });

            // Create a link element for downloading the file
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'orm_schema.svg'; // Specify the default filename

            // Trigger a click event on the link to initiate the download
            a.click();

            // Clean up resources (revoke the URL to free up memory)
            URL.revokeObjectURL(blob);
            a.remove()
          }
        }
      },
      'model-separator': {
        group: 'model',
        separator: true
      },
      'fitview': {
        group: 'view',
        className: 'mdi-overscan mdi',
        title: 'fit to screen',
        action: {
          click: function(event) {
            const {inner,outer} = canvas.viewbox();
            var center = {
              x: inner.x + inner.width/2,
              y: inner.y + inner.height/2
            };
            let scale = Math.min( 
              (outer.width / inner.width),
              (outer.height / inner.height)
            ) * 0.8;
            canvas.zoom('fit-viewport', center);
            canvas.zoom(scale);
          }
        }
      },
      'view-separator': {
        group: 'view',
        separator: true
      },
      'clear-model': {
        group: 'clear',
        className: 'mdi-trash-can-outline mdi',
        title: 'clear all elements',
        action: {
          click: function(event) {
            // clear the system, except for root
            var els = registry.getAll().filter(
                (v) => {
                    return !v.id.includes("implicitroot");
                }
            );
            if (els.length > 0){
                modeling.removeElements(
                    els
                );
            }
          }
        }
      },
    };
};