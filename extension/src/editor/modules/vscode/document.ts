
const yaml = require('js-yaml');

export interface documentNode {
    id: string;
    attributes: Map<string, any>;
}

export interface documentConnection extends documentNode {

}

export interface documentFact extends documentNode {

}

export class DocumentEntity implements documentNode{
    id: string;
    attributes: Map<string, any>;

    constructor(id: string, attributes?: Map<string, any>) {
        this.id = id;
        this.attributes = new Map<string, any>();
        if (attributes) {
            attributes.forEach((value, key) => {
                this.attributes.set(key, value);
            });
        } 
        
    }

    validate(): boolean {
        if (
            this.attributes.has("name") && 
            this.attributes.has("ref")  &&
            this.attributes.has("type") 
        ){
            return  this.attributes.get("type") === "entity" ||
                    this.attributes.get("type") === "value";
        }
        return false;
    }
}

export interface document {
    elements:Map<string, DocumentEntity>;
    facts: Map<string, documentFact>;
    connections: Map<string, documentConnection>;
    name: string;
    type: "ORM";
}

export class Document implements document{
    elements: Map<string, DocumentEntity>;
    facts: Map<string, documentFact>;
    connections: Map<string, documentConnection>;
    name: string;
    type: "ORM";
    

    constructor() {
        this.elements = new Map<string, DocumentEntity>();
        this.facts = new Map<string, documentFact>();
        this.connections = new Map<string, documentConnection>();
        this.name = "";
        this.type = "ORM";
    }

    public setName(name: string) {  
        this.name = name;
    }

    public addNode(type: string, 
        node: DocumentEntity | documentConnection | documentFact) {

    }

    public updateNode(type: string,
        node: DocumentEntity | documentConnection | documentFact) {

    }

    public addElement(node: DocumentEntity) {
        this.elements.set(node.id, node);
    }

    public removeElement(node: DocumentEntity) {
        this.elements.delete(node.id);
    }

    public addFact(node: documentFact) {
        this.facts.set(node.id, node);
    }

    public removeFact(node: documentFact) {
        this.facts.delete(node.id);
    }

    public addConnection(node: documentConnection) {
        this.connections.set(node.id, node);
    }

    public removeConnection(node: documentConnection) {
        this.connections.delete(node.id);
    }

    public getNodeById(id: string): DocumentEntity | documentConnection | documentFact | undefined {
        return this.elements.get(id) || this.connections.get(id) || this.facts.get(id);
    }
}

export default class DocumentParser {
    private static instance: DocumentParser;
    private constructor() {
        // private constructor to prevent instantiation
    }

    public static getInstance(): DocumentParser {
        if (!DocumentParser.instance) {
            DocumentParser.instance = new DocumentParser();
        }
        return DocumentParser.instance;
    }

    public parseDocument(document: string): Document {
        try {
            const data = yaml.load(document) as any;
            console.log("Parsed data: ", data);
            const parsedDocument = new Document();
            parsedDocument.setName(data.system || "Unnamed System");

            // Parse entities
            if (data.entities) {
                data.entities.forEach((entity: any) => {
                    
                    let atttributes = new Map<string, any>();
                    for (const key in entity) {
                        atttributes.set(key, entity[key]);
                    }
                    const documentEntity = new DocumentEntity(
                        entity.id, 
                        atttributes
                    );
                    if (documentEntity.validate()) {
                        parsedDocument.addElement(documentEntity);
                    }
                });
            }

            // Parse facts
            if (data.facts) {
                data.facts.forEach((fact: any) => {
                    const documentFact: documentFact = {
                        id: fact.id,
                        attributes: new Map<string, string>(),
                    };
                    for (const key in fact) {
                        documentFact.attributes.set(key, fact[key]);
                    }
                    parsedDocument.addFact(documentFact);
                });
            }

            // Parse connections
            if (data.connections) {
                data.connections.forEach((connection: any) => {
                    const documentConnection: documentConnection = {
                        id: connection.id,
                        attributes: new Map<string, string>(),
                    };
                    for (const key in connection) {
                        documentConnection.attributes.set(key, connection[key]);
                    }
                    parsedDocument.addConnection(documentConnection);
                });
            }

            return parsedDocument;
        } catch (error) {
            console.error("Error parsing YAML document:", error);
            throw new Error("Failed to parse document");
        }
    }
}