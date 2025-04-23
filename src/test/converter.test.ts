import { Type } from "@sinclair/typebox";
import * as assert from "assert";
import { convertTypeBoxToSwift } from "../converter/typebox-to-swift";

// Type과 t 별칭을 만들어 테스트에 사용
const t = Type;

suite("DTO Converter Test Suite", () => {
  test("Type.Object 형식의 기본 DTO 변환 테스트", () => {
    const typeboxDto = `export const loginDeviceDto = Type.Object({
      deviceToken: Type.String(),
      deviceOs: Type.String(),
      pushToken: Type.String(),
      voipToken: Type.String(),
      isDev: Type.Boolean(),
    });`;

    const expected = `struct LoginDeviceDto: Codable {
    let deviceToken: String
    let deviceOs: String
    let pushToken: String
    let voipToken: String
    let isDev: Bool
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("t.Object 형식의 기본 DTO 변환 테스트", () => {
    const typeboxDto = `export const loginDeviceDto = t.Object({
      deviceToken: t.String(),
      deviceOs: t.String(),
      pushToken: t.String(),
      voipToken: t.String(),
      isDev: t.Boolean(),
    });`;

    const expected = `struct LoginDeviceDto: Codable {
    let deviceToken: String
    let deviceOs: String
    let pushToken: String
    let voipToken: String
    let isDev: Bool
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("Optional 속성이 있는 DTO 변환 테스트", () => {
    const typeboxDto = `export const userDto = Type.Object({
      id: Type.Number(),
      name: Type.String(),
      email: Type.Optional(Type.String()),
      age: Type.Optional(Type.Number()),
    });`;

    const expected = `struct UserDto: Codable {
    let id: Double
    let name: String
    let email: String?
    let age: Double?
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("배열 속성이 있는 DTO 변환 테스트", () => {
    const typeboxDto = `export const userDto = Type.Object({
      id: Type.Number(),
      name: Type.String(),
      tags: Type.Array(Type.String()),
    });`;

    const expected = `struct UserDto: Codable {
    let id: Double
    let name: String
    let tags: [String]
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("enum 참조가 있는 DTO 변환 테스트", () => {
    const typeboxDto = `export const userDto = Type.Object({
      id: Type.Number(),
      name: Type.String(),
      role: roleEnum,
    });`;

    const expected = `struct UserDto: Codable {
    let id: Double
    let name: String
    let role: String
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("중첩 객체가 있는 DTO 변환 테스트", () => {
    const typeboxDto = `export const userProfileDto = Type.Object({
      id: Type.Number(),
      name: Type.String(),
      notifications: Type.Boolean(),
      theme: Type.String(),
    });`;

    const expected = `struct UserProfileDto: Codable {
    let id: Double
    let name: String
    let notifications: Bool
    let theme: String
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("객체 배열이 있는 DTO 변환 테스트", () => {
    const typeboxDto = `export const postDto = Type.Object({
      id: Type.Number(),
      title: Type.String(),
      content: Type.String(),
    });`;

    const expected = `struct PostDto: Codable {
    let id: Double
    let title: String
    let content: String
}`;

    const result = convertTypeBoxToSwift(typeboxDto);
    assert.strictEqual(result, expected);
  });

  test("잘못된 형식의 입력 테스트", () => {
    const invalidInput = `const notADto = { test: "hello" };`;
    const result = convertTypeBoxToSwift(invalidInput);
    assert.strictEqual(result, "// 변환할 수 없는 형식입니다");
  });
});
