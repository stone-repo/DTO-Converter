interface TypeProperty {
  type: string;
  description?: string;
  optional?: boolean;
  enum?: string[];
}

interface TypeObjectDefinition {
  properties: Record<string, TypeProperty>;
  additionalProperties?: boolean;
  required?: string[];
}

export function convertTypeBoxToSwift(text: string): string {
  try {
    // TypeBox 코드를 파싱 (Type.Object와 t.Object 두 가지 형식 모두 지원)
    const typeObjectMatch = text.match(/export\s+const\s+(\w+)\s*=\s*(Type|t)\.Object\(\{([^}]+)\}\)/s);
    
    if (!typeObjectMatch) {
      return '// 변환할 수 없는 형식입니다';
    }

    const dtoName = typeObjectMatch[1];
    const typePrefix = typeObjectMatch[2]; // Type 또는 t
    const propertiesText = typeObjectMatch[3];
    
    // 첫 글자를 대문자로 변환 (PascalCase로 만들기)
    const swiftStructName = dtoName.charAt(0).toUpperCase() + dtoName.slice(1);
    
    // 속성 파싱
    const propertyLines = propertiesText.split(',').map(line => line.trim()).filter(line => line.length > 0);
    const properties: Record<string, { type: string, optional: boolean }> = {};
    
    propertyLines.forEach(line => {
      // 기본 타입 처리 (Type.String() 또는 t.String() 등)
      const basicTypeMatch = line.match(/(\w+):\s*(Type|t)\.(\w+)\(\)/);
      if (basicTypeMatch) {
        const propName = basicTypeMatch[1];
        const typeBoxType = basicTypeMatch[3];
        
        // TypeBox 타입을 Swift 타입으로 변환
        const swiftType = convertTypeBoxTypeToSwift(typeBoxType);
        properties[propName] = { type: swiftType, optional: false };
        return;
      }
      
      // Optional 타입 처리
      const optionalMatch = line.match(/(\w+):\s*(Type|t)\.Optional\((Type|t)\.(\w+)\(\)\)/);
      if (optionalMatch) {
        const propName = optionalMatch[1];
        const typeBoxType = optionalMatch[4];
        
        const swiftType = convertTypeBoxTypeToSwift(typeBoxType);
        properties[propName] = { type: swiftType, optional: true };
        return;
      }
      
      // enum 처리 (Type.Union, enum 변수 참조 등)
      const enumRefMatch = line.match(/(\w+):\s*(\w+)/);
      if (enumRefMatch && !line.includes('Type.') && !line.includes('t.')) {
        const propName = enumRefMatch[1];
        // enum은 일단 String으로 처리
        properties[propName] = { type: 'String', optional: false };
        return;
      }
      
      // 배열 처리 (Type.Array 또는 t.Array)
      const arrayMatch = line.match(/(\w+):\s*(Type|t)\.Array\((Type|t)\.(\w+)\(\)\)/);
      if (arrayMatch) {
        const propName = arrayMatch[1];
        const elementType = convertTypeBoxTypeToSwift(arrayMatch[4]);
        properties[propName] = { type: `[${elementType}]`, optional: false };
        return;
      }
      
      // 중첩 객체 처리
      const nestedObjectMatch = line.match(/(\w+):\s*(Type|t)\.Object\(/);
      if (nestedObjectMatch) {
        const propName = nestedObjectMatch[1];
        // 중첩 객체는 [String: Any]로 처리 (테스트용)
        properties[propName] = { type: '[String: Any]', optional: false };
        return;
      }
      
      // 배열 내의 객체 처리
      const arrayObjectMatch = line.match(/(\w+):\s*(Type|t)\.Array\((Type|t)\.Object\(/);
      if (arrayObjectMatch) {
        const propName = arrayObjectMatch[1];
        // 배열 내 객체는 [[String: Any]]로 처리 (테스트용)
        properties[propName] = { type: '[[String: Any]]', optional: false };
        return;
      }
    });
    
    // Swift 코드 생성
    let swiftCode = `struct ${swiftStructName}: Codable {\n`;
    
    Object.entries(properties).forEach(([propName, prop]) => {
      swiftCode += `    let ${propName}: ${prop.type}${prop.optional ? '?' : ''}\n`;
    });
    
    swiftCode += `}`;
    
    return swiftCode;
  } catch (error) {
    console.error('변환 중 오류 발생:', error);
    return '// 변환 중 오류가 발생했습니다';
  }
}

function convertTypeBoxTypeToSwift(typeBoxType: string): string {
  switch (typeBoxType.toLowerCase()) {
    case 'string':
      return 'String';
    case 'number':
      return 'Double';
    case 'integer':
      return 'Int';
    case 'boolean':
      return 'Bool';
    case 'array':
      return '[Any]'; // 기본 배열 타입 (실제로는 더 구체적인 타입이 필요)
    case 'object':
      return '[String: Any]'; // 기본 객체 타입
    default:
      return 'Any';
  }
} 