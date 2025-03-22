import OrmEditor from '.';

/**
 * @type { import('vscode') }
 */
const vscode = acquireVsCodeApi();

const editorHolder = document.getElementById('editor');
console.log("found the editor holder")
const editor = OrmEditor(editorHolder)
console.log("connected to holder.")

// handle messages from the extension
// window.addEventListener('message', async (event) => {

//     const {
//       type,
//       body,
//       requestId
//     } = event.data;
  
//     switch (type) {
//     case 'init':
//       if (!body.content) {
//         // return editor.createDiagram();
//       } else {
//         // return editor.importXML(body.content);
//       }
  
//     case 'update': {
//       if (body.content) {
//         // return editor.importXML(body.content);
//       }
  
//       if (body.undo) {
//         // return editor.get('commandStack').undo();
//       }
  
//       if (body.redo) {
//         // return editor.get('commandStack').redo();
//       }
  
//       break;
//     }
  
//     case 'getText':
//       // return editor.saveXML({ format: true }).then(({ xml }) => {
//       //   return vscode.postMessage({
//       //     type: 'response',
//       //     requestId,
//       //     body: xml
//       //   });
//       // });
  
//     case 'focusCanvas':
//       // editor.get('canvas').focus();
//       // return;
//     }
// });

// signal to VS Code that the webview is initialized
vscode.postMessage({ type: 'ready' });

export default editor;