'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function getListOfFiles(myPath) {
    const result = [];
    const getAllFiles = (myPath) => {
        if (fs.existsSync(myPath)) {
            fs.readdirSync(myPath).forEach((file) => {
                const curPath = myPath + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    getAllFiles(curPath);
                }
                else {
                    if (path.extname(curPath) == '.js') {
                        result.push(curPath);
                    }
                }
            });
        }
    };
    getAllFiles(myPath);
    return result;
}
function getPathToSrc() {
    const srcPath = vscode.workspace.getConfiguration('cucumber-step-mapper').get('srcPath').toString();
    return path.join(vscode.workspace.rootPath, srcPath);
}
function getStepDef(files) {
    const result = [];
    files.forEach((file) => {
        const lines = fs.readFileSync(file).toString().split("\n");
        lines.forEach((i, line) => {
            if (i.indexOf('(/^') >= 0) {
                result.push({
                    regex: i.substring(i.indexOf('(/^') + 3, i.indexOf('$/,')),
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
    textEditor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    const newPosition = position.with(position.line, 0);
    const newSelection = new vscode.Selection(newPosition, newPosition);
    vscode.window.activeTextEditor.selection = newSelection;
};
function goToDef() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const step = editor.document.lineAt(editor.selection.active.line).text.trim();
        const paths = getPathToSrc();
        const filesarray = getListOfFiles(paths);
        const steps = getStepDef(filesarray);
        const result = steps.find((elem) => {
            return step.search(elem.regex) >= 0;
        });
        const doc = yield vscode.workspace.openTextDocument(result.file);
        const textEditor = yield vscode.window.showTextDocument(doc);
        scrollToNewPositon(textEditor, result.line);
    });
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.goToDef', goToDef);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map