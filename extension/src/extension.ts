import * as path from 'path';
import * as vscode from 'vscode';
import { OrmEditorProvider } from './ormEditor';
import { ORMCreate } from './ormCreate';
import { ORMCreateDebug } from './ormDebugCreate';

export function activate(context: vscode.ExtensionContext) {
	// editor provider
	context.subscriptions.push(OrmEditorProvider.register(context));

	// helper commands
	ORMCreate.register(context);
	ORMCreateDebug.register(context);
}
  