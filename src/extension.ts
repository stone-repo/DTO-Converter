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

	// 자동 변환 기능 활성화 여부 가져오기
	const getIsCopyPasteAutoConverterEnable = (): boolean => {
		return vscode.workspace.getConfiguration('dto-converter').get('isCopyPasteAutoConverterEnable', true);
	};

	// 자동 변환 기능 활성화 여부 설정하기
	const setIsCopyPasteAutoConverterEnable = async (enabled: boolean): Promise<void> => {
		await vscode.workspace.getConfiguration('dto-converter').update('isCopyPasteAutoConverterEnable', enabled, true);
		vscode.window.showInformationMessage(`CopyPaste AutoConverter가 ${ enabled ? '활성화' : '비활성화'} 되었습니다.`);
	};

	// TypeBox -> Swift 변환 설정 가져오기
	const getAutoConverterEnabled = (): boolean => {
		return vscode.workspace.getConfiguration('dto-converter').get('copyPasteAutoConverter.typeboxToSwift', true);
	};

	// TypeBox -> Swift 변환 설정 저장하기
	const setAutoConverterEnabled = async (enabled: boolean): Promise<void> => {
		await vscode.workspace.getConfiguration('dto-converter').update('copyPasteAutoConverter.typeboxToSwift', enabled, true);
	};

	// TypeBox DTO를 Swift로 변환하는 명령어 등록 (선택 후 변환)
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
		
		// 선택된 텍스트를 Swift 코드로 대체
		editor.edit(editBuilder => {
			editBuilder.replace(selection, swiftCode);
		});
	});

	// 자동 변환 활성화 명령어
	const enableCopyPasteAutoConverterCommand = vscode.commands.registerCommand('dto-converter.enableCopyPasteAutoConverter', async () => {
		await setIsCopyPasteAutoConverterEnable(true);
	});

	// 자동 변환 비활성화 명령어
	const disableCopyPasteAutoConverterCommand = vscode.commands.registerCommand('dto-converter.disableCopyPasteAutoConverter', async () => {
		await setIsCopyPasteAutoConverterEnable(false);
	});

	// 기본 붙여넣기 명령어 오버라이드
	const pasteCommand = vscode.commands.registerCommand('editor.action.clipboardPasteAction', async () => {
		const editor = vscode.window.activeTextEditor;
		
		// 클립보드 내용 가져오기
		const clipboardText = await vscode.env.clipboard.readText();
		
		// Swift 파일이 아니거나 자동 변환 기능이 꺼져있거나 TypeBox->Swift 변환이 꺼져있으면 기본 붙여넣기 실행
		if (!editor || 
			editor.document.languageId !== 'swift' || 
			!getIsCopyPasteAutoConverterEnable() || 
			!getAutoConverterEnabled()) {
			// 직접 클립보드 내용 삽입 (기본 붙여넣기 동작 대신)
			if (editor) {
				editor.edit(editBuilder => {
					editBuilder.insert(editor.selection.active, clipboardText);
				});
			}
			return;
		}
		
		// TypeBox DTO 패턴 검사
		const typeboxPattern = /export\s+const\s+(\w+)\s*=\s*(Type|t)\.Object\(\{([^}]+)\}\)/;
		
		if (clipboardText.includes('Type.Object({') || clipboardText.includes('t.Object({')) {
			const match = clipboardText.match(typeboxPattern);
			
			if (match) {
				// TypeBox DTO를 Swift로 변환
				const swiftCode = convertTypeBoxToSwift(clipboardText);
				
				// 변환된 코드를 에디터에 삽입
				editor.edit(editBuilder => {
					editBuilder.insert(editor.selection.active, swiftCode);
				}).then(success => {
					if (success) {
						console.log('CopyPaste AutoConverter success', success);
						// 성공 알림 표시 (우측 하단에 작은 알림)
						vscode.window.setStatusBarMessage('✅ TypeBox DTO가 Swift 코드로 변환되었습니다', 3000);
					} else {
						console.error('CopyPaste AutoConverter failed');
						// 실패 알림 표시
						vscode.window.showErrorMessage('TypeBox DTO를 Swift 코드로 변환하는 데 실패했습니다');
					}
				});
				return;
			}
		}
		
		// TypeBox DTO가 아니면 기본 붙여넣기 실행 (클립보드 내용 직접 삽입)
		editor.edit(editBuilder => {
			editBuilder.insert(editor.selection.active, clipboardText);
		});
	});

	// 모든 리소스 등록
	context.subscriptions.push(dtoConverterProvider);
	context.subscriptions.push(convertTypeboxToSwiftCommand);
	context.subscriptions.push(enableCopyPasteAutoConverterCommand);
	context.subscriptions.push(disableCopyPasteAutoConverterCommand);
	context.subscriptions.push(pasteCommand);
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
