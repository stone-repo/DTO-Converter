import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";

suite("자동 변환 테스트 스위트", () => {
  let sandbox: sinon.SinonSandbox;
  let clipboardSpy: sinon.SinonStub;

  setup(async () => {
    // 테스트 설정
    sandbox = sinon.createSandbox();

    // 클립보드 읽기 기능을 스텁으로 대체 (실제 클립보드에 의존하지 않기 위해)
    clipboardSpy = sandbox.stub(vscode.env, "clipboard");

    // 원래 설정값 저장 및 테스트를 위한 기본값 설정
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("isCopyPasteAutoConverterEnable", true, true);
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("copyPasteAutoConverter.typeboxToSwift", true, true);
  });

  teardown(async () => {
    // 테스트 후 정리
    sandbox.restore();
  });

  // 자동 변환 활성화/비활성화 테스트
  test("자동 변환 활성화/비활성화 테스트", async () => {
    // 자동 변환 기능 활성화 상태 확인
    let isEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("isCopyPasteAutoConverterEnable");
    assert.strictEqual(isEnabled, true, "기본적으로 자동 변환 기능이 활성화되어 있어야 함");

    // 자동 변환 기능 비활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("isCopyPasteAutoConverterEnable", false, true);
    isEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("isCopyPasteAutoConverterEnable");
    assert.strictEqual(isEnabled, false, "자동 변환 기능이 비활성화되어야 함");

    // 자동 변환 기능 다시 활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("isCopyPasteAutoConverterEnable", true, true);
    isEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("isCopyPasteAutoConverterEnable");
    assert.strictEqual(isEnabled, true, "자동 변환 기능이 다시 활성화되어야 함");
  });

  // TypeBox to Swift 변환 설정 테스트
  test("TypeBox to Swift 변환 설정 테스트", async () => {
    // TypeBox to Swift 변환 활성화 상태 확인
    let isTypeboxToSwiftEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("copyPasteAutoConverter.typeboxToSwift");
    assert.strictEqual(
      isTypeboxToSwiftEnabled,
      true,
      "TypeBox to Swift 변환이 기본적으로 활성화되어 있어야 함",
    );

    // TypeBox to Swift 변환 비활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("copyPasteAutoConverter.typeboxToSwift", false, true);
    isTypeboxToSwiftEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("copyPasteAutoConverter.typeboxToSwift");
    assert.strictEqual(isTypeboxToSwiftEnabled, false, "TypeBox to Swift 변환이 비활성화되어야 함");

    // TypeBox to Swift 변환 다시 활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("copyPasteAutoConverter.typeboxToSwift", true, true);
    isTypeboxToSwiftEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("copyPasteAutoConverter.typeboxToSwift");
    assert.strictEqual(
      isTypeboxToSwiftEnabled,
      true,
      "TypeBox to Swift 변환이 다시 활성화되어야 함",
    );
  });

  // 참고: 통합 테스트에서의 테스트 제한 사항
  // 아래 테스트들은 VS Code API와의 통합 테스트를 위한 기본 구조만 제공합니다.
  // 실제 클립보드 이벤트와 변환 동작은 통합 테스트 환경에서 완전히 테스트하기 어려울 수 있습니다.

  test("설정 변경시 클립보드 리스너 활성화/비활성화 테스트", async () => {
    // 이 테스트는 실제로 리스너가 활성화/비활성화되는지 직접 테스트하기 어려우므로
    // 단순히 설정이 변경되는지만 확인합니다

    // 비활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("isCopyPasteAutoConverterEnable", false, true);
    const isDisabled = !vscode.workspace
      .getConfiguration("dto-converter")
      .get("isCopyPasteAutoConverterEnable");
    assert.strictEqual(isDisabled, true, "설정이 비활성화 상태로 변경되어야 함");

    // 다시 활성화
    await vscode.workspace
      .getConfiguration("dto-converter")
      .update("isCopyPasteAutoConverterEnable", true, true);
    const isEnabled = vscode.workspace
      .getConfiguration("dto-converter")
      .get("isCopyPasteAutoConverterEnable");
    assert.strictEqual(isEnabled, true, "설정이 활성화 상태로 변경되어야 함");
  });
});
