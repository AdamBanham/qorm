
export default (function () {
    
    /**
     * @type { import('vscode') }
     */
    const vscode = acquireVsCodeApi();

    const OrmEditor = require('./index.ts').default;

    const editorHolder = document.getElementById('editor');
    const editor = OrmEditor(editorHolder);

    editor.get('canvas').zoom('fit-viewport');

    /**
     * @type { import('./modules/vscode/handler') }
     * @description The message handler for the vscode extension.
     */
    const handler = editor.get('vscodeMessageHandler');

    // handle messages from the extension
    window.addEventListener('message', async (event) => {
        const {
          type
        } = event.data;

        handler.poolMessages(type, event.data);
    });

    // signal to VS Code that the webview is initialized
    vscode.postMessage({ type: 'ready' });

    // module.exports = editor;
}());