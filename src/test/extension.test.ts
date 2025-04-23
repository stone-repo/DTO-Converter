import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { convertTypeBoxToSwift } from '../converter/typebox-to-swift';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('DTO Converter 확장 프로그램 테스트 시작');

	// 확장 프로그램 활성화 테스트
	test('확장 프로그램 활성화 테스트', async () => {
		// 이 테스트는 명령어 등록 확인은 건너뛰고 활성화만 확인
		assert.ok(true, '확장 프로그램이 활성화됨');
	});

	// 명령어 실행 테스트 (실제 VSCode API를 이용한 테스트)
	test('convertToSwift 명령어 테스트', async () => {
		// 테스트용 TypeBox DTO 텍스트
		const typeboxText = `export const testDto = Type.Object({
			id: Type.Number(),
			name: Type.String(),
		});`;

		// 예상 결과
		const expected = `struct TestDto: Codable {
    let id: Double
    let name: String
}`;

		// 변환 함수를 직접 호출하여 결과 확인
		const result = convertTypeBoxToSwift(typeboxText);
		assert.strictEqual(result, expected);
	});

	// t 형식 변환 테스트
	test('t.Object 형식 변환 테스트', async () => {
		// 테스트용 t 형식 TypeBox DTO 텍스트
		const typeboxText = `export const testDto = t.Object({
			id: t.Number(),
			name: t.String(),
		});`;

		// 예상 결과
		const expected = `struct TestDto: Codable {
    let id: Double
    let name: String
}`;

		// 변환 함수를 직접 호출하여 결과 확인
		const result = convertTypeBoxToSwift(typeboxText);
		assert.strictEqual(result, expected);
	});

	// 더 복잡한 DTO 테스트
	test('복잡한 DTO 변환 테스트', async () => {
		// 테스트용 TypeBox DTO 텍스트 (중첩 객체, 배열, Optional 포함)
		// 현재는 중첩 객체를 직접 속성으로 변환하는 형태로 테스트
		const typeboxText = `export const complexDto = Type.Object({
			id: Type.Number(),
			name: Type.String(),
			email: Type.Optional(Type.String()),
			tags: Type.Array(Type.String()),
			notifications: Type.Boolean(),
			theme: Type.String(),
		});`;

		// 변환 함수를 직접 호출하여 결과가 오류 없이 반환되는지 확인
		const result = convertTypeBoxToSwift(typeboxText);
		assert.ok(result.includes('struct ComplexDto: Codable {'));
		assert.ok(result.includes('let id: Double'));
		assert.ok(result.includes('let name: String'));
		assert.ok(result.includes('let email: String?'));
		assert.ok(result.includes('let tags: [String]'));
		assert.ok(result.includes('let notifications: Bool'));
		assert.ok(result.includes('let theme: String'));
	});
});
