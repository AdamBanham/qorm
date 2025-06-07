
const yaml = require('js-yaml');

export interface documentNode {
    id: string;
    attributes: Map<string, any>;
    validate: () => boolean;
    requires: () => string;
}

export class DocumentConnection implements documentNode {
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

    validate() {
        // todo
        return true;
    }

    requires() {
        // todo
        return "id,";
    }
}

export class DocumentFact implements documentNode {
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

        if (this.validate()) {
            if (!this.attributes.has("roles")) {
                this.attributes.set("roles", 
                    this.attributes.get("factors").length
                );
            }
        }
        
    }

    validate(): boolean {
        if (
            this.attributes.has("x") && 
            this.attributes.has("y")  &&
            this.attributes.has("factors") 
        ){
            return  this.attributes.get("type") === "fact";
        }
        return false;
    }

    requires(): string {
        return "x,y,factors=[],type=fact";
    }
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
            this.attributes.has("type") &&
            this.attributes.has("x") &&
            this.attributes.has("y")
        ){
            return  this.attributes.get("type") === "entity" ||
                    this.attributes.get("type") === "value";
        }
        return false;
    }

    requires(): string {
        return "name,x,y,type=entity|value";
    }
}

export interface document {
    elements:Map<string, DocumentEntity>;
    facts: Map<string, DocumentFact>;
    connections: Map<string, DocumentConnection>;
    name: string;
    type: "ORM";
}

export class Document implements document{
    elements: Map<string, DocumentEntity>;
    facts: Map<string, DocumentFact>;
    connections: Map<string, DocumentConnection>;
    name: string;
    type: "ORM";
    

    constructor() {
        this.elements = new Map<string, DocumentEntity>();
        this.facts = new Map<string, DocumentFact>();
        this.connections = new Map<string, DocumentConnection>();
        this.name = "";
        this.type = "ORM";
    }

    public setName(name: string) {  
        this.name = name;
    }

    public addElement(node: DocumentEntity) {
        this.elements.set(node.id, node);
    }

    public removeElement(node: DocumentEntity) {
        this.elements.delete(node.id);
    }

    public addFact(node: DocumentFact) {
        this.facts.set(node.id, node);
    }

    public removeFact(node: DocumentFact) {
        this.facts.delete(node.id);
    }

    public addConnection(node: DocumentConnection) {
        this.connections.set(node.id, node);
    }

    public removeConnection(node: DocumentConnection) {
        this.connections.delete(node.id);
    }

    public getNodeById(id: string): DocumentEntity | DocumentConnection | DocumentFact | undefined {
        return this.elements.get(id) || this.connections.get(id) || this.facts.get(id);
    }

    public removeNodeById(id: string): void {
        this.elements.delete(id);
        this.connections.delete(id);
        this.facts.delete(id);
    }

    public findConnectionBetween(src:string, tgt:string, role:number): DocumentConnection | undefined{
        let ret;
        for(let con of this.connections.values()){
            if (con.attributes.get('source') == src &&
                con.attributes.get('target') == tgt &&
                con.attributes.get('role') == role){
                    ret = con;
                    break;
                }
        }
        return ret;
    }

    /**
     * Converts the current document to a YAML string.
     * @returns {string} the document in YAML format
     */
    public yamlify(): string {
        const plainObject = {
            system : {
                name: this.name,
                type: this.type,
                entities: Array.from(this.elements.values()).map(
                    (element) => (
                    Object.assign({
                        id: element.id,
                    }, Object.fromEntries(element.attributes)
                    )
                )),
                facts: Array.from(this.facts.values()).map(
                    (fact) => (
                    Object.assign({
                        id: fact.id,
                    }, Object.fromEntries(fact.attributes)
                    )
                )),
                connections: Array.from(this.connections.values()).map(
                    (connection) => (
                    Object.assign({
                        id: connection.id,
                    }, Object.fromEntries(connection.attributes)
                    )
                )),
            }
        };
        return yaml.dump(plainObject);
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
            const parsedDocument = new Document();
            let system = data.system;
            parsedDocument.setName(system.name|| "Unnamed System");

            // Parse entities
            if (system.entities) {
                for(let entity of system.entities){                    
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
                    } else {
                        console.warn("Invalid entity:", entity);
                        throw new Error("Invalid entity :: " 
                            + entity.id
                            + " requires: "
                            + documentEntity.requires()
                        );
                    }
                }
            }

            // Parse facts
            if (system.facts) {
                for(let fact of system.facts){
                    let atttributes = new Map<string, any>();
                    for (const key in fact) {
                        atttributes.set(key, fact[key]);
                    }
                    const documentFact = new DocumentFact(
                        fact.id,
                        atttributes,
                    );
                    if (documentFact.validate()) {
                        parsedDocument.addFact(documentFact);
                    } else {
                        console.warn("Invalid fact:", fact);
                        throw new Error("Invalid fact :: " 
                            + fact.id
                            + " requires: "
                            + documentFact.requires()
                        );
                    }
                }
            }

            // Parse connections
            if (system.connections) {
                for(let connection of system.connections){
                    let attributes = new Map<string, any>();
                    for (const key in connection) {
                        attributes.set(key, connection[key]);
                    }
                    const documentConnection = new DocumentConnection(
                        connection.id,
                        attributes,
                    );
                    if (documentConnection.validate()){
                        parsedDocument.addConnection(documentConnection);
                    } else {
                        console.warn("Invalid fact:", connection);
                        throw new Error("Invalid fact :: " 
                            + connection.id
                            + " requires: "
                            + documentConnection.requires()
                        );
                    }
                    
                }
            }

            return parsedDocument;
        } catch (error: any) {
            console.warn("Error parsing YAML document:", error);
            throw new Error(error.message);
        }
    }
}