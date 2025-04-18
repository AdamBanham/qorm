
import DocuementParser from "./document";
import { Document } from "./document";
import { documentNode, DocumentEntity, documentFact, documentConnection } from "./document";
import { isEqualSets } from "../utils/sets";
import { json } from "stream/consumers";
import { isEntity, isFact } from "../model/util";

interface differences {
    changes: Array<DocumentEntity | documentFact | documentConnection>;
    removals: Array<DocumentEntity | documentFact | documentConnection>;
    additions: Array<DocumentEntity | documentFact | documentConnection>;
}

export default  class VscodeMessageHandler {
    static $inject: Array<string>;
    oldDocuments: Map<string, Document>;
    pushInterval: NodeJS.Timeout | null;
    _modeling: any;
    _elementRegistry: any;
    _elementFactory: any;
    _eventBus: any;
    _canvas: any;

    constructor(eventBus:any, modeling:any, elementRegistry:any, 
                elementFactory:any, canvas:any) {
        this.oldDocuments = new Map<string, Document>();
        this.pushInterval = null;
        this._modeling = modeling;
        this._elementRegistry = elementRegistry;
        this._elementFactory = elementFactory;
        this._eventBus = eventBus;
        this._canvas = canvas;

    }

    poolMessages(type:string, context:object) {
        var that = this;
        console.log("Pooling message: ", type);
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
        console.log("Handling message from vscode: ", type, context);

        switch (type) {
            case "update":
                this.handleUpdate(context['text']);
                break;
        }
    }

    handleUpdate(document:string) {
        const parser = DocuementParser.getInstance();
        try {
            const parsedDocument = parser.parseDocument(document);
            console.log(parsedDocument);
            console.log(this.oldDocuments.get(parsedDocument.name));
            let changed = this._findChangedElements(parsedDocument);
            this._fireChangedElementsinDocument(changed);
            this.oldDocuments.set(parsedDocument.name, parsedDocument);
            return;
        } catch (e) {
            console.error('Error parsing document:', e);
            return;
        }
    }

    _findChangedElements(newDoc: Document): differences {
        const changedNodes = new Array<DocumentEntity | documentFact | documentConnection>();
        const removedNodes = new Array<DocumentEntity | documentFact | documentConnection>();
        const addedNodes = new Array<DocumentEntity | documentFact | documentConnection>();
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
            console.log("Comparing nodes: ", oldNode, newNode);
            if (!oldNode) {
                // Node is new
                addedNodes.push(newNode);
            } else {
                const oldKeys = new Set(oldNode.attributes.keys());
                const newKeys = new Set(newNode.attributes.keys());
                if (!isEqualSets(oldKeys, newKeys)) {
                    // Node is updated
                    console.log("keys are different: ", oldKeys, newKeys);
                    changedNodes.push(newNode);
                } else {
                //    check if the values are different
                    let isDifferent = false;
                    oldNode.attributes.forEach((value, key) => {
                        const oldJson = JSON.stringify(newNode.attributes.get(key));
                        const newJson = JSON.stringify(value);
                        if (oldJson !== newJson) {
                            console.log("values are different: ", key, value, newNode.attributes.get(key));
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
        console.log("Firing changed elements in document: ", diff);
        // handle new additions
        const viewport = this._canvas.viewbox();
        const centerX = viewport.x + (viewport.width / 2);
        const centerY = viewport.y + (viewport.height / 2);
        diff.additions.forEach((node) => {
            console.log("Adding node: ", node);
            let element: any;
            let pos = {
                x: node.attributes.get('x') || centerX, 
                y: node.attributes.get('y') || centerY
            };
            if (node.attributes.get('type') === 'entity') {
                element = this._elementFactory.createDummyAttributesForEntities("entity");
                element = this._modeling.createShape(
                    Object.assign(element, Object.fromEntries(node.attributes)),
                    pos,
                    this._canvas.getRootElement()
                );
                element.update();
            } else if (node.attributes.get('type') === 'fact') {
                element = this._elementFactory.createDummyAttributesForFacts();
                element = this._modeling.createShape(
                    Object.assign(element, Object.fromEntries(node.attributes)),
                    pos,
                    this._canvas.getRootElement()
                );
                console.log("Adding pre-fact: ", element);
                debugger;
                element.factors = new Array(element.roles).fill(null);
                let factors = node.attributes.get('factors') || [];
                
                factors.forEach((role: any) => {
                    let entity = this._elementRegistry.get(role);
                    if (!entity) {
                        console.error("Entity not found: ", role);
                        return;
                    }
                    this._modeling.connectToFact(element,entity);
                });
                console.log("Adding fact: ", element);
                element.update();
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
                element = this._elementFactory.createDummyAttributesForConnection();
                return;
            } else {
                console.error("Unknown type: ", node.attributes.get('type'));
            }
            
        });

        diff.changes.forEach((node) => {
            console.log("Updating node: ", node);
            let element = this._elementRegistry.get(node.id);
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
            console.log("Removing node: ", node);
            let element = this._elementRegistry.get(node.id);
            if (element) {
                this._modeling.removeElements([element]);
            } else {
                console.error("Element not found: ", node.id);
            }
        });
    }
}

VscodeMessageHandler.$inject = [
    'eventBus',
    'modeling',
    'elementRegistry',
    'elementFactory',
    'canvas'
];