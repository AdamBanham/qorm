import * as path from 'path';
import * as vscode from 'vscode';
import { OrmEditorProvider } from './ormEditor';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(OrmEditorProvider.register(context));
}
  