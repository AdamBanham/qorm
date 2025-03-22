"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const catScratchEditor_1 = require("./catScratchEditor");
const pawDrawEditor_1 = require("./pawDrawEditor");
function activate(context) {
    // Register our custom editor providers
    context.subscriptions.push(catScratchEditor_1.CatScratchEditorProvider.register(context));
    context.subscriptions.push(pawDrawEditor_1.PawDrawEditorProvider.register(context));
}
//# sourceMappingURL=extension.js.map