'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const vslog = vscode.window.createOutputChannel("cucumber-gotostep");

function getListOfFiles(myPath) {
    const result = [];
    const getAllFiles = (myPath) => {
        if (fs.existsSync(myPath)) {
            fs.readdirSync(myPath).forEach((file) => {
                const curPath = myPath + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    getAllFiles(curPath);
                } else {
                    if (path.extname(curPath) === '.js' || path.extname(curPath) === '.ts') {
                        result.push(curPath);
                    }
                }
            });
        } else {
            vslog.appendLine(`${module.id}.getListOfFiles(myPath): PATH DOES NOT EXIST: ${myPath}`);
        }
    };
    getAllFiles(myPath);
    return result;
}

function getPathToSrc() {
    const srcPath = vscode.workspace.getConfiguration('cucumber-gotostep').get('srcPath').toString();
    return path.join(vscode.workspace.rootPath, srcPath);
}

function getStepDef(files) {
    const result = [];
    files.forEach((file) => {
        const lines = fs.readFileSync(file).toString().split("\n");
        lines.forEach((i, line) => {
            if (i.indexOf('(/^') >= 0) {
                result.push({
                    regex: i.substring(i.indexOf('/^') + 2, i.indexOf('$/,')),
                    file: file,
                    line: line
                });
            }
        });
    });
    return result;
}

const scrollToNewPositon = (textEditor, line) => {
    const position = new vscode.Position(line, 0);
    const range = new vscode.Range(position, position);
    textEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
    const newPosition = position.with(position.line, 0);
    const newSelection = new vscode.Selection(newPosition, newPosition);
    vscode.window.activeTextEditor.selection = newSelection;
}

async function goToDef () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    // Skip the given/when/then 1st word from the line
    const step = editor.document.lineAt(editor.selection.active.line).text.trim().split(' ').slice(1, +Infinity).join(' ');
    const paths = getPathToSrc();
    const filesarray = getListOfFiles(paths);
    const steps = getStepDef(filesarray);
    const result = steps.find((elem) => {
        try {
            const re = new RegExp(elem.regex, 'g');
            return re.test(step);
        } catch (ex) {
            vslog.appendLine(`goToDef() - EXCEPTION `, ex);
            return false;
        }
    });

    if (result) {
        const doc = await vscode.workspace.openTextDocument(result.file, {preserveFocus: true, pinned: true});
        const textEditor = await vscode.window.showTextDocument(doc);
        scrollToNewPositon(textEditor, result.line);
    }
}


export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.goToDef', goToDef);
    context.subscriptions.push(disposable);
    vslog.appendLine(`Cucumber Goto Step is active!`);
}

export function deactivate() { }