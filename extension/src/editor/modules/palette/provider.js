export default function ExamplePaletteProvider(
    create, elementFactory, lassoTool, palette, connect, registry,
    modeling, canvas, eventBus) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._lassoTool = lassoTool;
    this._palette = palette;
    this._connect = connect;
    this._registry = registry;
    this._modeling = modeling;
    this._canvas = canvas;
    this._bus = eventBus;
  
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
  ];
  
  
  ExamplePaletteProvider.prototype.getPaletteEntries = function() {
    var create = this._create,
        factory = this._elementFactory,
        lassoTool = this._lassoTool,
        registry = this._registry,
        modeling = this._modeling,
        canvas = this._canvas,
        bus = this._bus;
  
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
            console.log("save schema");
          }
        }
      },
      'export-svg': {
        group: 'model',
        className: 'mdi-export mdi',
        title: 'Export SVG',
        action: {
          click: function(event) {
            console.log("export svg");
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
            const {inner} = canvas.viewbox()
            var center = {
              x: inner.x + inner.width/2,
              y: inner.y + inner.height/2
            }
            canvas.zoom('fit-viewport', center)
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