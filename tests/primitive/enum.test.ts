import {lepton} from "../../src";
import {testWrappers} from "../test-utils";

describe("Enum Tests", () => {
	describe("String Enums", () => {
		test("Invalid initialization", () => {
			//@ts-ignore
			expect(() => lepton.enum()).toThrow(); // No arguments
			//@ts-ignore
			expect(() => lepton.enum(1)).toThrow(); // Invalid type
			//@ts-ignore
			expect(() => lepton.enum([])).toThrow(); // Empty array
			//@ts-ignore
			expect(() => lepton.enum([1])).toThrow(); // String values
			//@ts-ignore
			expect(() => lepton.enum(["a", "a"])).toThrow(); // Duplicate values
		});

		const enumValues = ["apple", "banana", "orange"] as const;
		const FruitEnum = lepton.enum(enumValues);

		test("Should validate", () => {
			// Valid values
			expect(FruitEnum.parse("apple")).toBe("apple");
			expect(FruitEnum.parse("banana")).toBe("banana");
			expect(FruitEnum.parse("orange")).toBe("orange");

			// Invalid values
			//@ts-ignore
			expect(() => FruitEnum.parse("grape")).toThrow();
			expect(() => FruitEnum.parse(123 as any)).toThrow();

			// Encoding/decoding
			const encoded = FruitEnum.encode("banana");
			expect(typeof encoded).toBe("string");
			expect(FruitEnum.decode(encoded)).toBe("banana");

			// Get options
			expect(FruitEnum.options).toEqual(["apple", "banana", "orange"]);
		});

		test("Should validate and encode/decode enum values", () => {
			// Valid values
			expect(FruitEnum.parse("apple")).toBe("apple");
			expect(FruitEnum.parse("banana")).toBe("banana");
			expect(FruitEnum.parse("orange")).toBe("orange");

			// Invalid values
			//@ts-ignore
			expect(() => FruitEnum.parse("grape")).toThrow();
			expect(() => FruitEnum.parse(123 as any)).toThrow();

			// Encoding/decoding
			const encoded = FruitEnum.encode("banana");
			expect(typeof encoded).toBe("string");
			expect(FruitEnum.decode(encoded)).toBe("banana");

			// Get options
			expect(FruitEnum.options).toEqual(["apple", "banana", "orange"]);
		});

		test("Exclude/Extract", () => {
			const ExcludedEnum = FruitEnum.exclude(["banana"]);
			expect(ExcludedEnum.options).toEqual(["apple", "orange"]);
			//@ts-ignore
			expect(() => ExcludedEnum.parse("banana")).toThrow();

			const ExtractedEnum = FruitEnum.extract(["apple", "orange"]);
			expect(ExtractedEnum.options).toEqual(["apple", "orange"]);
			//@ts-ignore
			expect(() => ExtractedEnum.parse("banana")).toThrow();
		});

		test("Additional features", () => {
			expect(Object.keys(FruitEnum.enum)).toEqual(enumValues);
			expect(FruitEnum.options).toEqual(enumValues);
		});

		testWrappers(FruitEnum, "apple", "grape");
	});

	describe("Native Enums", () => {
		describe("String enums", () => {
			enum Fruits {
				Apple = "APPLE",
				Banana = "BANANA",
				Orange = "ORANGE",
			}
			const FruitSchema = lepton.nativeEnum(Fruits);

			test("Should validate and encode/decode string enum values", () => {
				expect(FruitSchema.parse(Fruits.Apple)).toBe("APPLE");
				expect(FruitSchema.parse(Fruits.Banana)).toBe("BANANA");
				expect(FruitSchema.parse(Fruits.Orange)).toBe("ORANGE");

				// Direct string values should work too
				//@ts-ignore
				expect(FruitSchema.parse("APPLE")).toBe("APPLE");
				//@ts-ignore
				expect(FruitSchema.parse("BANANA")).toBe("BANANA");

				// Invalid values
				//@ts-ignore
				expect(() => FruitSchema.parse("GRAPE")).toThrow();
				expect(() => FruitSchema.parse(123 as any)).toThrow();

				// Encoding/decoding
				const encoded = FruitSchema.encode(Fruits.Banana);
				expect(typeof encoded).toBe("string");
				expect(FruitSchema.decode(encoded)).toBe(Fruits.Banana);
			});

			testWrappers(FruitSchema, "APPLE", "GRAPE");
		});

		describe("Numeric enums", () => {
			enum Status {
				Active = 0,
				Pending = 1,
				Inactive = 2,
			}
			const StatusSchema = lepton.nativeEnum(Status);

			test("Should validate and encode/decode numeric enum values", () => {
				// Valid values
				expect(StatusSchema.parse(Status.Active)).toBe(0);
				expect(StatusSchema.parse(Status.Pending)).toBe(1);
				expect(StatusSchema.parse(Status.Inactive)).toBe(2);

				// Direct numeric values should work too
				//@ts-ignore
				expect(StatusSchema.parse("0")).toBe(0);
				expect(StatusSchema.parse(0)).toBe(0);
				expect(StatusSchema.parse(1)).toBe(1);

				// Invalid values
				//@ts-ignore
				expect(() => StatusSchema.parse(3)).toThrow();
				expect(() => StatusSchema.parse("ACTIVE" as any)).toThrow();

				// Encoding/decoding
				const encoded = StatusSchema.encode(Status.Pending);
				expect(typeof encoded).toBe("string");
				expect(StatusSchema.decode(encoded)).toBe(Status.Pending);
			});

			test("Additional features", () => {
				expect(Object.keys(StatusSchema.enum)).toEqual(Object.keys(Status));
			});

			testWrappers(StatusSchema, Status.Active, 4);
		});
	});
});
