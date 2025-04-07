import {LeptonType} from "../src/lib/types";

export function testWrappers(schema: LeptonType<any, any>, validType: any, invalidType: any) {
	test("Should handle optional values", () => {
		const optional = schema.optional();
		expect(optional.parse(validType)).toBe(validType);
		expect(() => optional.parse(invalidType)).toThrow();

		// Encoding and decoding
		expect(() => optional.encode(null)).toThrow();
		expect(optional.decode(optional.encode(validType))).toBe(validType);
		expect(optional.decode(optional.encode(undefined))).toBe(undefined);
	});

	test("Should handle nullable values", () => {
		const nullable = schema.nullable();
		expect(nullable.parse(validType)).toBe(validType);
		expect(() => nullable.parse(invalidType)).toThrow();

		// Encoding and decoding
		expect(() => nullable.encode(undefined)).toThrow();
		expect(nullable.decode(nullable.encode(null))).toBe(null);
		expect(nullable.decode(nullable.encode(validType))).toBe(validType);
	});

	test("Should create an array of values", () => {
		const array = schema.array();
		expect(array.parse([validType])).toEqual([validType]);
		expect(array.parse([])).toEqual([]);
		expect(() => array.parse([invalidType])).toThrow();

		// Encoding and decoding
		expect(() => array.encode([invalidType])).toThrow();
		expect(array.decode(array.encode([]))).toEqual([]);
		expect(array.decode(array.encode([validType]))).toEqual([validType]);
	});
}
