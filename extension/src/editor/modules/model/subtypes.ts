
import { OrmConnection } from "./connections";

export const SUBTYPE_NAME = "subtype-connection";

export function createSubtype(){
    return new OrmSubtypeConnection();
}

export class OrmSubtypeConnection extends OrmConnection {

    constructor(){
        super(-1, false);
        this.type = SUBTYPE_NAME;
    }

} 