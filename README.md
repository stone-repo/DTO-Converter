# DTO Converter

DTO Converter는 다양한 프로그래밍 언어 간의 데이터 전송 객체(DTO)를 변환하는 VS Code 확장 프로그램입니다.

## 기능

현재 지원되는 변환:
- TypeScript (TypeBox) → Swift (Codable)
  - `Type.Object()` 형식과 `t.Object()` 형식 모두 지원

## 사용 방법

### TypeBox DTO를 Swift Codable로 변환하기

#### 방법 1: 오른쪽 클릭 메뉴 사용
1. TypeScript 파일에서 TypeBox로 정의된 DTO 코드를 선택하세요.
2. 선택한 코드에서 마우스 오른쪽 버튼을 클릭하고 "DTO: Convert to Swift Codable"을 선택하세요.
3. 변환된 Swift 코드가 클립보드에 복사됩니다.
4. Swift 파일에 붙여넣으세요.

#### 방법 2: 직접 붙여넣기 (자동 변환)
1. TypeScript 파일에서 TypeBox로 정의된 DTO 코드를 복사하세요.
2. Swift 파일에 붙여넣으면 자동으로 Swift Codable 코드로 변환됩니다.

## 예시

### TypeBox DTO (TypeScript - Type.Object 형식)

```typescript
export const loginDeviceDto = Type.Object({
  deviceToken: Type.String(),
  deviceOs: deviceOsEnum,
  pushToken: Type.String(),
  voipToken: Type.String(),
  isDev: Type.Boolean(),
});
```

### TypeBox DTO (TypeScript - t.Object 형식)

```typescript
export const loginDeviceDto = t.Object({
  deviceToken: t.String(),
  deviceOs: deviceOsEnum,
  pushToken: t.String(),
  voipToken: t.String(),
  isDev: t.Boolean(),
});
```

### 변환된 Swift Codable

```swift
struct LoginDeviceDto: Codable {
    let deviceToken: String
    let deviceOs: String
    let pushToken: String
    let voipToken: String
    let isDev: Bool
}
```

## 지원 예정 기능

- Swift (Codable) → TypeScript (TypeBox)
- TypeScript (TypeBox) → Kotlin (data class)
- TypeScript (TypeBox) → Python (dataclass)
- 그 외 다양한 언어 지원 예정

## 피드백 및 기여

버그 신고나 기능 요청은 [GitHub 이슈](https://github.com/yourusername/dto-converter/issues)를 통해 제출해 주세요.
