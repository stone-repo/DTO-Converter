import { Type } from '@sinclair/typebox';

// 샘플 enum 타입 (Type 형식)
const deviceOsEnum = Type.Union([
  Type.Literal('ios'),
  Type.Literal('android'),
]);

// 샘플 DTO (Type 형식)
export const loginDeviceDto = Type.Object({
  deviceToken: Type.String(),
  deviceOs: deviceOsEnum,
  pushToken: Type.String(),
  voipToken: Type.String(),
  isDev: Type.Boolean(),
});

// 중첩 객체를 포함한 복잡한 DTO (Type 형식)
export const userProfileDto = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String(),
  age: Type.Optional(Type.Number()),
  isActive: Type.Boolean(),
  tags: Type.Array(Type.String()),
  settings: Type.Object({
    notifications: Type.Boolean(),
    theme: Type.String(),
  }),
});

// 배열 필드가 있는 DTO (Type 형식)
export const postListDto = Type.Object({
  posts: Type.Array(Type.Object({
    id: Type.Number(),
    title: Type.String(),
    content: Type.String(),
    published: Type.Boolean(),
  })),
  totalCount: Type.Number(),
  page: Type.Number(),
});

// t. 형식 예제 (원래 TypeBox 라이브러리는 실제로 t. 대신 Type을 사용하지만, 레거시 코드를 위한 예제)
export const productDto = {
  id: { type: 'number' },
  name: { type: 'string' },
  price: { type: 'number' },
  description: { type: 'string' },
  inStock: { type: 'boolean' }
};

// t. 형식 예제를 TypeBox 문법으로 변환한 예시 (테스트용)
// 실제 TypeBox는 t 객체를 export하지 않지만, 다른 라이브러리들은 t. 형식을 사용하는 경우가 있음
const t = Type; // 별칭 사용
export const tStyleProductDto = t.Object({
  id: t.Number(),
  name: t.String(),
  price: t.Number(),
  description: t.String(),
  inStock: t.Boolean(),
}); 