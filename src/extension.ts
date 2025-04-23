// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { convertTypeBoxToSwift } from './converter/typebox-to-swift';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dto-converter" is now active!');

	// 복사된 텍스트를 감지하고 변환하는 기능 추가
	const dtoConverterProvider = vscode.languages.registerCodeActionsProvider(
		{ language: 'typescript' },
		new DTOActionProvider(),
		{ providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite] }
	);

	// TypeBox DTO를 Swift로 변환하는 명령어 등록
	const convertTypeboxToSwiftCommand = vscode.commands.registerCommand('dto-converter.convertTypeboxToSwift', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('에디터가 활성화되어 있지 않습니다.');
			return;
		}

		const selection = editor.selection;
		const text = editor.document.getText(selection);

		// TypeBox 형식 확인 (Type.Object 또는 t.Object)
		if (!text.includes('Type.Object({') && !text.includes('t.Object({')) {
			vscode.window.showErrorMessage('선택된 텍스트가 TypeBox DTO 형식이 아닙니다.');
			return;
		}

		const swiftCode = convertTypeBoxToSwift(text);
		
		// 클립보드에 변환된 코드 복사
		await vscode.env.clipboard.writeText(swiftCode);
		vscode.window.showInformationMessage('Swift 코드가 클립보드에 복사되었습니다.');
	});

	// 클립보드 감시 기능 (Swift 파일에 붙여넣기 할 때 사용)
	const clipboardListener = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || event.document !== editor.document) {
			return;
		}

		// Swift 파일에서만 작동
		if (editor.document.languageId !== 'swift') {
			return;
		}

		// 텍스트 변경 감지 (붙여넣기 작업)
		const changes = event.contentChanges;
		if (changes.length === 0) {
			return;
		}

		const pastedText = changes[0].text;
		
		// TypeBox DTO 형식인지 확인 (Type.Object 또는 t.Object)
		if (pastedText.includes('Type.Object({') || pastedText.includes('t.Object({')) {
			// 변환
			const swiftCode = convertTypeBoxToSwift(pastedText);
			
			// 붙여넣은 TypeBox 코드를 Swift 코드로 대체
			const range = new vscode.Range(
				editor.document.positionAt(changes[0].rangeOffset),
				editor.document.positionAt(changes[0].rangeOffset + changes[0].rangeLength)
			);
			
			editor.edit(editBuilder => {
				editBuilder.replace(range, swiftCode);
			});
		}
	});

	// 모든 리소스 등록
	context.subscriptions.push(dtoConverterProvider);
	context.subscriptions.push(convertTypeboxToSwiftCommand);
	context.subscriptions.push(clipboardListener);
}

// 코드 액션 제공 클래스
class DTOActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeAction[]> {
		// 선택된 텍스트 가져오기
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document !== document) {
			return [];
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			return [];
		}

		const text = document.getText(selection);

		// TypeBox DTO인지 확인 (Type.Object 또는 t.Object)
		if (!text.includes('Type.Object({') && !text.includes('t.Object({')) {
			return [];
		}

		// 코드 액션 생성
		const action = new vscode.CodeAction('Swift Codable로 변환', vscode.CodeActionKind.RefactorRewrite);
		action.command = {
			command: 'dto-converter.convertTypeboxToSwift',
			title: 'Swift Codable로 변환',
			tooltip: 'TypeBox DTO를 Swift Codable struct로 변환'
		};

		return [action];
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
