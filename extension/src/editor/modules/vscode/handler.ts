
import DocuementParser from "./document";
import { Document } from "./document";
import { documentNode, DocumentEntity, DocumentFact, DocumentConnection } from "./document";
import { isEqualSets } from "../utils/sets";
import { isEntity, isExactlyEntity, isFact } from "../model/util";
import { isConnection } from "diagram-js/lib/util/ModelUtil";
import { unitHeight as entityHeight, unitWidth as entityWidth } from "../model/entities";
import { unitHeight as factHeight, unitWidth as factWidth } from "../model/facts";
import { transformToViewbox } from "../utils/canvasUtils";
import VscodeMessager from "./messager";

interface differences {
    changes: Array<DocumentEntity | DocumentFact | DocumentConnection>;
    removals: Array<DocumentEntity | DocumentFact | DocumentConnection>;
    additions: Array<DocumentEntity | DocumentFact | DocumentConnection>;
}

interface handlerState {
    status: "working" | "idle";
}

export default  class VscodeMessageHandler {
    static $inject: Array<string>;
    oldDocuments: Map<string, Document>;
    currentDocument: Document;
    pushInterval: NodeJS.Timeout | null;
    vscodeInterval: NodeJS.Timeout | null;
    _messager: VscodeMessager;
    _modeling: any;
    _elementRegistry: any;
    _elementFactory: any;
    _eventBus: any;
    _canvas: any;
    _api: any;
    _seenCons: Set<any>;
    _first_load: boolean = true;
    state: handlerState;

    constructor(eventBus:any, modeling:any, elementRegistry:any, 
                elementFactory:any, canvas:any, messager:any) {
        this.oldDocuments = new Map<string, Document>();
        this.pushInterval = null;
        this.vscodeInterval = null;
        this._modeling = modeling;
        this._elementRegistry = elementRegistry;
        this._elementFactory = elementFactory;
        this._eventBus = eventBus;
        this._canvas = canvas;
        this._api = null;
        this._messager = messager;
        this._seenCons = new Set<any>();
        this.state = {
            status: "idle"
        };
        this.currentDocument = new Document();

        this._eventBus.on(['element.changed', 'shape.move'], (e:any) => {
            if (this.state.status !== "working") {
                this.updateElementsOnDocument([e.element]);
            }
        });

        this._eventBus.on('elements.changed', (e:any) => {
            if (this.state.status !== "working") {
                this.updateElementsOnDocument(e.elements);
            }
        });

        this._eventBus.on('factory.create', (e:any) => {
            if (this.state.status !== "working") {
                this.addElementToDocument(e.element);
            }
        });

        this._eventBus.on('elements.removed', (e:any) => {
            if (this.state.status !== "working") {
                this.removeElementsOnDocument(e.elements);
            }
        });

        this._eventBus.on('shape.removed', (e:any) => {
            if (this.state.status !== "working") {
                this.removeElementsOnDocument([e.element]);
            }
        });

    }

    setApi(api:any) {
        this._api = api;
    }

    poolMessages(type:string, context:object) {
        var that = this;
        if (!this.pushInterval) {
            this.pushInterval = setTimeout(() => {
                that.handleMessage(type, context);
            }, 250);
        } else {
            clearTimeout(this.pushInterval);
            this.pushInterval = setTimeout(() => {
                that.handleMessage(type, context);
            }, 250);
        }
    }

    handleMessage(type:string, context:any){
        switch (type) {
            case "update":
                this.handleUpdate(context['text']);
                break;
        }
    }

    handleUpdate(document:string) {
        const parser = DocuementParser.getInstance();
        try {
            this.state.status = "working";
            const parsedDocument = parser.parseDocument(document);
            let changed = this._findChangedElements(parsedDocument);
            this._fireChangedElementsinDocument(changed);
            this.oldDocuments.set(parsedDocument.name, parsedDocument);
            this.currentDocument = parsedDocument;
            if (this._first_load) {
                this.triggerVscodeUpdate();
                this._first_load = false;
            }
            this.state.status = "idle";
            return;
        } catch (e: any) {
            console.warn('Error parsing document:', e);
            this._messager.sendWarningMessage(
                "Error parsing document: " + e.message
            );
            this.state.status = "idle";
            return;
        }
    }

    _findChangedElements(newDoc: Document): differences {
        const changedNodes = new Array<DocumentEntity | DocumentFact | DocumentConnection>();
        const removedNodes = new Array<DocumentEntity | DocumentFact | DocumentConnection>();
        const addedNodes = new Array<DocumentEntity | DocumentFact | DocumentConnection>();
        const oldDoc = this.oldDocuments.get(newDoc.name) || new Document();

        // Compare elements
        this._compareNodes(oldDoc.elements, newDoc.elements,
             changedNodes, removedNodes, addedNodes);

        // Compare facts
        this._compareNodes(oldDoc.facts, newDoc.facts,
             changedNodes, removedNodes, addedNodes);

        // Compare connections
        this._compareNodes(oldDoc.connections, newDoc.connections,
             changedNodes, removedNodes ,addedNodes);

        return {
            changes: changedNodes,
            removals: removedNodes,
            additions: addedNodes,
        };
    }

    _compareNodes(
        oldNodes: Map<string, documentNode>,
        newNodes: Map<string, documentNode>,
        changedNodes: Array<documentNode>,
        removedNodes: Array<documentNode>,
        addedNodes: Array<documentNode>
    ) {
        // Detect added or updated nodes
        newNodes.forEach((newNode, id) => {
            const oldNode = oldNodes.get(id);
            if (!oldNode) {
                // Node is new
                addedNodes.push(newNode);
            } else {
                const oldKeys = new Set(oldNode.attributes.keys());
                const newKeys = new Set(newNode.attributes.keys());
                if (!isEqualSets(oldKeys, newKeys)) {
                    // Node is updated
                    changedNodes.push(newNode);
                } else {
                //    check if the values are different
                    let isDifferent = false;
                    oldNode.attributes.forEach((value, key) => {
                        const oldJson = JSON.stringify(newNode.attributes.get(key));
                        const newJson = JSON.stringify(value);
                        if (oldJson !== newJson) {
                            isDifferent = true;
                        }
                    });
                    if (isDifferent) {
                        // Node is updated
                        changedNodes.push(newNode);
                    }
                }
            }
        });

        // Detect removed nodes
        oldNodes.forEach((oldNode, id) => {
            if (!newNodes.has(id)) {
                // Node is removed
                removedNodes.push(oldNode);
            }
        });
    }

    _fireChangedElementsinDocument(
        diff: differences){
        // handle new additions
        const viewport = this._canvas.viewbox();
        const centerX = viewport.x + (viewport.width / 2);
        const centerY = viewport.y + (viewport.height / 2);
        this._seenCons = new Set<any>();
        diff.additions.forEach((node) => {
            let element: any;
            let pos = {
                x: node.attributes.get('x') || centerX, 
                y: node.attributes.get('y') || centerY
            };
            if (node.attributes.get('type') === 'entity' || 
                node.attributes.get('type') === 'value') {
                element = this._elementFactory.createDummyAttributesForEntities("entity");
                pos.x = pos.x + (entityWidth / 2);
                pos.y = pos.y + (entityHeight / 2);
                element = this._modeling.createShape(
                    Object.assign(element, Object.fromEntries(node.attributes)),
                    pos,
                    this._canvas.getRootElement()
                );
                element.update();
                this._modeling.sendUpdate(element);
            } else if (node.attributes.get('type') === 'fact') {
                element = this._elementFactory.createDummyAttributesForFacts();
                pos.x = pos.x + (
                    (factWidth * node.attributes.get('roles') 
                    + node.attributes.get('objectified') ? 10 : 0) 
                    / 2);
                pos.y = pos.y + (factHeight/2);
                element = this._modeling.createShape(
                    Object.assign(element, Object.fromEntries(node.attributes)),
                    pos,
                    this._canvas.getRootElement()
                );
                element.update();
                this._handleCreationForFact(element, node.attributes);
                this._modeling.sendUpdate(element);
            } else if (node.attributes.get('type') === 'value') {
                element = this._elementFactory.createDummyAttributesForEntities("value");
                element = this._modeling.createShape(
                    Object.assign(element, Object.fromEntries(node.attributes)),
                    pos,
                    this._canvas.getRootElement()
                );
                element.update();
            } else if (node.attributes.get('type') === 'connection') {
                let con = this._handleCreationForConnection(node.attributes);
                if (con){
                    this._modeling.sendUpdate(con);
                }
                return;
            } else {
                console.error("Unknown type: ", node.attributes.get('type'));
            }
            
        });

        diff.changes.forEach((node) => {
            let element = this._elementRegistry.get(node.id);
            console.log("diff-element ::", element)
            console.log("diff-attributes ::", node.attributes)
            element = Object.assign(
                element,
                Object.fromEntries(node.attributes)
            );
            if (isEntity(element) || isFact(element)) {
                element.update();
            }
            this._modeling.sendUpdate(element);
        });

        diff.removals.forEach((node) => {
            let element = this._elementRegistry.get(node.id);
            if (element) {
                this._modeling.removeElements([element]);
            }
        });
    }

    _handleCreationForConnection(attributes:Map<string, any>) {
        let src = this._elementRegistry.get(attributes.get('source'));
        let target = this._elementRegistry.get(attributes.get('target'));
        let con = null;
        if (!src || !target) {
            console.error("Source or target not found: ", attributes.get('source'), attributes.get('target'));
            return null;
        }

        for(let other of src.outgoing){
            if (other.target.id === target.id){
                if (other.role === attributes.get('role')){
                    con = other;
                    break;
                }
            }
        }
        // most connections are creasted when facts are included
        // so the next step checks that existing connections have the 
        // same attributes as the doc
        if (con){
            if (this._seenCons.has(con.id)){
                console.warn("Connection already seen: ", attributes.get("id"));
                return con;
            } else {
                this._seenCons.add(con.id);
                attributes.set('id', con.id);
            }
            con.waypoints = attributes.get('waypoints').slice();
            if (attributes.get('mandatory')){
                con.setMandatory(attributes.get('mandatory'));
            }
            con.lastEdit = attributes.get('lastEdit');
            this._modeling.layoutConnection(con);
            this._modeling.moveElements([con,con.source,con.target], 
                {x: 0, y: 0}
            );
            return con;
        }
        // handling for subtyping
        else {
            if ( isExactlyEntity(src) && isExactlyEntity(target) ){
                let con = this._modeling.createSubtypeBetween(
                    src,
                    target
                );
                con.waypoints = attributes.get('waypoints');
                this._seenCons.add(con.id);
                this._modeling.layoutConnection(con);
                    this._modeling.moveElements([con,con.source,con.target], 
                        {x: 0, y: 0}
                );
                return con;
            }
        }
        console.warn(
            "[vscode.handler] Unable to make new connection for :: ",
             attributes.get('id')
        );
        return null;
    }

    /**
     * Handles the creation of the extra parts around fact elements.
     * @param {Fact} element the current fact being created
     * @param {Map<string, any>} attributes the attributes from document
     */
    _handleCreationForFact(element:any, attributes:Map<string, any>) {
        element.factors = new Array(element.roles).fill(null);
        let factors = attributes.get('factors') || [null];
        let factLabel = attributes.get('label') || false;
        let derived = attributes.get('derived') || false;
        let derivedLabel = attributes.get('derivedLabel') || undefined;
        
        factors.forEach((role: any, id: number) => {
            if (role === null) {
                return;
            }
            let entity = this._elementRegistry.get(role);
            if (!entity) {
                console.error("Entity not found: ", role);
                return;
            }
            this._modeling.connectToFact(element,entity, id);
        });

        if (factLabel) {
            this._modeling.createLabelForFact(
                element, factLabel
            );
            this._modeling.sendUpdate(...element.labels);
        }

        if (derived){
            this._modeling.makeDerivedLabel(element,derivedLabel);
        }

        if (element.uniqueness){
            element.uniqueness.forEach((unique: any) => {
                var attrs = this._elementFactory
                    .createDummyAttributesForConstraintOverFact(element);
                attrs.mode = unique.mode;
                attrs.over = unique.over;
                let pos = element.getNextFreeContraintPosition();
                var constraint = this._modeling.createShape(
                    Object.assign({}, attrs),
                    pos,
                    element.parent
                );
                element.addConstraint(constraint);
                this._modeling.sendUpdate(constraint);
            });
        }

        element.update();
        
    }

    _handleUpdatesForFact(element:any, attributes:Map<string, any>) {

        if (element.roles > attributes.get('roles')) {
            let diff = element.roles - attributes.get('roles');
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    this._modeling.reduceFact(element);
                }
            } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) {
                    this._modeling.expandFact(element);
                }
            }
        }

        // if (!attributes.get('derived')) {
        //     if (element.derived === false) {
        //         console.warn("Removing derived label for: ", element.id);
        //         this._modeling.flipDerivation(element);
        //     }
        // }
        // if (attributes.get('derived') === true) {
        //     let labelName = attributes.get('derivedLabel') || "...";
        //     if (element.derived) {
        //         this._modeling.changeDerivedLabel(labelName);
        //     } else {
        //         this._modeling.flipDerivation(element);
        //         this._modeling.changeDerivedLabel(labelName);
        //     }
        // }

    }

    triggerVscodeUpdate() {
        if (this.state.status === "working") {
            console.warn("Document is being updated, skipping...");
            return;
        }
        try {
            var that = this;
            if (this.vscodeInterval === null) {
                this.vscodeInterval = setTimeout(() => {
                    that.updateDocumentWithYaml(that.currentDocument);
                }, 250);
            } else {
                clearTimeout(this.vscodeInterval);
                this.vscodeInterval = setTimeout(() => {
                    that.updateDocumentWithYaml(that.currentDocument);
                }, 250);
            }
        } catch (error) {
            console.error("Error triggering VSCode update:", error);
        }
    }

    async updateDocumentWithYaml(document: Document) {
        if (this.state.status === "working") {
            console.warn("Document is being updated, skipping...");
            return;
        }
        try {
            // Convert the document to YAML
            const yamlContent = document.yamlify();

            // Get the active text editor
            this._api.postMessage({
                type: 'vscode.write',
                content: yamlContent,
            });
            
        } catch (error) {
            console.error("Error updating document with YAML:", error);
        }
    }

    updateElementsOnDocument(elements: Array<any>) {
        if (this.state.status === "working") {
            console.warn("Document is being updated, skipping...");
            return;
        }
        elements.forEach((element) => {
            if (isFact(element) || isEntity(element)) {
                let docElement = this.currentDocument.getNodeById(element.id);
                let attributes = element.buildAttributes();
                if (isFact(element)) {
                    this._handleUpdatesForFact(element, attributes);
                }
                if (docElement) {
                    docElement.attributes = new Map<string, any>([
                        ...docElement.attributes,
                        ...element.buildAttributes()
                    ]);
                }
            }
            if (isConnection(element)) {
                if (!element.source || !element.target) {
                    return;
                }
                let connection = this.currentDocument.findConnectionBetween(
                    element.source.id, element.target.id, element.role
                );
                if (connection) {
                    connection.attributes = new Map<string, any>([
                        ...connection.attributes,
                        ...element.buildAttributes()
                    ]);
                } else {
                    this.addElementToDocument(element);
                }
            }
        });

        this.triggerVscodeUpdate();
    }

    addElementToDocument(element: any) {
        if (this.state.status === "working") {
            console.warn("Document is being updated, skipping...");
            return;
        }
        if (isEntity(element)) {
            let id = element.id;
            let attributes = element.buildAttributes();
            this.currentDocument.addElement(new DocumentEntity(
                id, attributes
            ));
        }
        if (isFact(element)) {
            let id = element.id;
            let attributes = element.buildAttributes();
            this.currentDocument.addFact(
            new DocumentFact(
                id,
                attributes
            )
            );
        }
        if (isConnection(element)) {
            let id = element.id;
            if (!element.source || !element.target) {
                return;
            }
            let attributes = element.buildAttributes();
            this.currentDocument.addConnection(new DocumentConnection(
                id,
                attributes
            ));
        }
    }

    removeElementsOnDocument(elements: Array<any>) {
        
        if (this.state.status === "working") {
            console.warn("Document is being updated, skipping...");
            return;
        }
        elements.forEach((element) => {
            if (isConnection(element)){
                let temp = this.currentDocument.findConnectionBetween(
                    element.source.id, element.target.id, element.role
                );
                if (!temp){
                    console.warn(`Unable to find connection to delete ${element.id}`, element);
                } else {
                    this.currentDocument.removeNodeById(
                        temp.id
                    );
                }
            } else {
                this.currentDocument.removeNodeById(element.id);
            }
        });

        this.triggerVscodeUpdate();
    }

}

VscodeMessageHandler.$inject = [
    'eventBus',
    'modeling',
    'elementRegistry',
    'elementFactory',
    'canvas',
    'vscodeMessager'
];