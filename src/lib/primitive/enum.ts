import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";

type Writeable<T> = {-readonly [P in keyof T]: T[P]};
type EnumLike = {
	[k: string]: string | number;
	[nu: number]: string;
};
type EnumValues<T extends string = string> = readonly [T, ...T[]];
type Values<T extends EnumValues> = {
	[k in T[number]]: k;
};

/**
 * Represents an enum type in Lepton schemas
 * Validates that values are part of a predefined set of allowed values
 * @template T The enum values type
 */
export class LeptonEnum<T extends [string, ...string[]]> extends LeptonType<T[number], T[number]> {
	private readonly values: T;
	private readonly valueMap: Map<string | number, boolean>;

	/**
	 * Creates a new enum schema
	 * @param values Array of allowed values (either all strings or all numbers)
	 */
	constructor(values: T) {
		super();

		if (values == null) throw LeptonError.create("Enum values cannot be null or undefined");
		if (!Array.isArray(values)) throw LeptonError.create("Enum values must be an array");
		if (values.length === 0) throw LeptonError.create("Enum must have at least one value");
		if (!values.every((val) => typeof val === "string")) throw LeptonError.create("All enum values must be of the same type (string)");
		if (new Set(values).size !== values.length) throw LeptonError.create("Enum values must be unique");

		this.values = values;
		this.valueMap = new Map(values.map((val) => [val, true]));
	}

	/**
	 * Validates that the input is one of the allowed enum values
	 * @param input The input to validate
	 * @returns The validated enum value
	 * @throws {LeptonError} If input is not one of the allowed enum values
	 */
	parse(input: this["_input"]): this["_output"] {
		if (!this.valueMap.has(String(input))) throw LeptonError.create(`Invalid enum value. Expected one of: ${this.values.join(", ")}, got: ${input}`);
		return input;
	}

	/**
	 * Serializes an enum value
	 * @param value The enum value to encode
	 * @returns Hex string representation of the serialized enum value
	 * @throws {LeptonError} If value is not one of the allowed enum values
	 */
	encode(value: T[number]): string {
		this.parse(value); // Validate the value

		const index = this.values.indexOf(value);
		return index.toString(16).padStart(2, "0");
	}

	/**
	 * Raw decoding operation for enum values that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedValue, remainingBytes]
	 * @throws {LeptonError} If the encoded value doesn't match any enum value
	 */
	_rawDecode(bytes: string): [this["_output"], string] {
		if (bytes.length < 2) throw LeptonError.create("Not enough bytes to decode enum value");

		const index = parseInt(bytes.slice(0, 2), 16);
		if (index >= this.values.length) throw LeptonError.create(`Invalid enum index: ${index}`);
		return [this.values[index] as T[number], bytes.slice(2)];
	}

	/**
	 * Makes this enum optional (value or undefined)
	 * @returns A new optional schema for this enum
	 */
	optional(): LeptonOptional<this> {
		return new LeptonOptional(this);
	}

	/**
	 * Makes this enum nullable (value or null)
	 * @returns A new nullable schema for this enum
	 */
	nullable(): LeptonNullable<this> {
		return new LeptonNullable(this);
	}

	/**
	 * Creates an array of this enum type
	 * @returns A new array schema for this enum
	 */
	array(): LeptonArray<this> {
		return new LeptonArray(this);
	}

	/**
	 * Creates a new enum schema that excludes specified values
	 * @param values Values to exclude from the enum
	 * @returns A new enum schema without the specified values
	 * @example
	 * const FruitEnum = lepton.enum(["apple", "banana", "orange"]);
	 * const LimitedFruitEnum = FruitEnum.exclude(["banana"]);
	 */
	exclude<V extends T[number][]>(values: V): LeptonEnum<[Exclude<T[number], V[number]>, ...Exclude<T[number], V[number]>[]]> {
		const valuesToExclude = new Set(values);
		const filteredValues = this.values.filter((val) => !valuesToExclude.has(val));
		if (filteredValues.length === 0) throw LeptonError.create("Cannot exclude all values from an enum");
		return new LeptonEnum(filteredValues as [Exclude<T[number], V[number]>, ...Exclude<T[number], V[number]>[]]);
	}

	/**
	 * Creates a new enum schema that only includes the specified values
	 * @param values Values to include in the new enum
	 * @returns A new enum schema with only the specified values
	 * @example
	 * const FruitEnum = lepton.enum(["apple", "banana", "orange", "pear"]);
	 * const CitrusEnum = FruitEnum.extract(["orange"]);
	 */
	extract<V extends T[number][]>(values: V): LeptonEnum<[V[number], ...V[number][]]> {
		for (const val of values) if (!this.valueMap.has(val)) throw LeptonError.create(`Value "${val}" is not in the enum`);

		if (values.length === 0) throw LeptonError.create("Cannot create an enum with no values");
		return new LeptonEnum(values as unknown as [T[number], ...T[number][]]);
	}

	/**
	 * Creates a TypeScript enum object from this enum schema
	 * This is useful for generating TypeScript enums at runtime
	 * @returns A TypeScript enum-like object with values from this schema
	 * @example
	 * const FruitEnum = lepton.enum(["apple", "banana", "orange"]);
	 * const Fruits = FruitEnum.enum;
	 * // Now you can use: Fruits.apple, Fruits.banana, Fruits.orange
	 */
	get enum(): Values<T> {
		return this.values.reduce((acc, value) => {
			acc[value] = value;
			return acc;
		}, {} as any);
	}

	/**
	 * Returns an array of all possible enum values
	 * @returns Array of all enum values
	 */
	get options(): T {
		return this.values;
	}
}

function createEnum<U extends string, T extends Readonly<[U, ...U[]]>>(values: T): LeptonEnum<Writeable<T>>;
function createEnum<U extends string, T extends [U, ...U[]]>(values: T): LeptonEnum<T>;
function createEnum(values: [string, ...string[]]) {
	return new LeptonEnum(values);
}
export {createEnum as enum};

export class LeptonNativeEnum<T extends EnumLike, Keys extends readonly string[]> extends LeptonType<T[keyof T], T[keyof T]> {
	private readonly enumObject: T;
	private readonly enumKeys: Keys;
	private readonly isNumericEnum: boolean;

	private constructor(enumObject: T, keys: Keys) {
		super();
		this.enumObject = enumObject;
		this.enumKeys = keys;

		const firstValue = enumObject[keys[0] as keyof T];
		this.isNumericEnum = typeof firstValue === "number";
	}

	static create<T extends EnumLike>(enumObject: T): LeptonNativeEnum<T, [keyof T & string, ...(keyof T & string)[]]> {
		const enumKeys = Object.keys(enumObject).filter((k) => isNaN(Number(k))) as [keyof T & string, ...(keyof T & string)[]];
		if (enumKeys.length === 0) throw new LeptonError("No valid enum keys found");
		return new LeptonNativeEnum(enumObject, enumKeys);
	}

	parse(input: this["_input"]): this["_output"] {
		if (this.isNumericEnum && typeof input === "string" && !isNaN(Number(input))) input = Number(input) as this["_input"];
		for (const key of this.enumKeys) if (this.enumObject[key] === input) return input as unknown as this["_output"];
		throw LeptonError.create(`Invalid enum value. Expected one of: ${this.enumKeys.map((k) => this.enumObject[k]).join(", ")}, got: ${input}`);
	}

	encode(value: T[keyof T]): string {
		this.parse(value);

		const valueIndex = Object.values(this.enumObject)
			.filter((val) => (typeof val === "string") === !this.isNumericEnum || typeof val === "number")
			.indexOf(value);
		if (valueIndex === -1) throw LeptonError.create(`Could not encode enum value: ${value}`);
		return valueIndex.toString(16).padStart(2, "0");
	}

	_rawDecode(bytes: string): [this["_output"], string] {
		if (bytes.length < 2) throw LeptonError.create("Not enough bytes to decode enum value");

		const index = parseInt(bytes.slice(0, 2), 16);
		const validValues = Object.values(this.enumObject).filter((val) => (typeof val === "string") === !this.isNumericEnum || typeof val === "number");
		if (index >= validValues.length) throw LeptonError.create(`Invalid enum index: ${index}`);
		return [validValues[index] as this["_output"], bytes.slice(2)];
	}

	optional(): LeptonOptional<this> {
		return new LeptonOptional(this);
	}

	nullable(): LeptonNullable<this> {
		return new LeptonNullable(this);
	}

	array(): LeptonArray<this> {
		return new LeptonArray(this);
	}

	get enum(): T {
		return this.enumObject;
	}
}

/**
 * Creates a schema from a TypeScript enum
 * @param enumObject The TypeScript enum object
 * @returns A schema for the enum's values with proper type safety
 * @example
 * enum Fruits {
 *   Apple = "APPLE",
 *   Banana = "BANANA",
 *   Orange = "ORANGE"
 * }
 * const fruitSchema = lepton.nativeEnum(Fruits);
 *
 * // Or with numeric enums
 * enum Status {
 *   Active,  // 0
 *   Pending, // 1
 *   Inactive // 2
 * }
 * const statusSchema = lepton.nativeEnum(Status);
 */
export function nativeEnum<T extends EnumLike>(enumObject: T): LeptonNativeEnum<T, [keyof T & string, ...(keyof T & string)[]]> {
	return LeptonNativeEnum.create(enumObject);
}
