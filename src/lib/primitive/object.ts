import {LeptonType, LeptonTypeAny} from "../types.ts";
import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {type addQuestionMarks, type extendShape, type flatten, mergeShapes, type MergeShapes} from "../../utils.ts";

/**
 * Type representing an object shape with string keys and Lepton type values
 */
type ObjectShape = {
	[k: string]: LeptonTypeAny;
};

/**
 * Utility type that extracts the TypeScript output type from an object schema definition
 */
type ObjectTypeOutput<T extends ObjectShape> = flatten<
	addQuestionMarks<{
		[k in keyof T]: T[k]["_output"];
	}>
>;

/**
 * Implements an object type for Lepton schemas
 * Objects are composed of named properties with defined schema types
 * @template T The shape of the object with property names and their schema types
 */
export class LeptonObject<T extends ObjectShape, Strict extends boolean = false> extends LeptonType<ObjectTypeOutput<T>, ObjectTypeOutput<T>> {
	/** The schema definition for each property in the object */
	private readonly shape: T;
	/** Whether unknown properties should be rejected during validation */
	private readonly isStrict: boolean;

	/**
	 * Creates a new object schema
	 * @param shape Object mapping property names to their schema types
	 * @param isStrict Whether to reject unknown properties during validation (default: false)
	 */
	constructor(shape: T, isStrict: boolean = false) {
		super();
		this.shape = shape;
		this.isStrict = isStrict;
	}

	/**
	 * Validates and transforms an object input according to the schema
	 * @param input The input to validate
	 * @returns Validated object with properly typed properties
	 * @throws {LeptonError} If validation fails, input is not an object, or unknown properties are found in strict mode
	 */
	parse(input: Strict extends true ? ObjectTypeOutput<T> : Record<string, unknown>): ObjectTypeOutput<T> {
		if (typeof input !== "object" || input === null) throw LeptonError.create(`Expected object, got ${typeof input}`);

		if (this.isStrict) {
			const inputObj = input as Record<string, unknown>;
			const extraKeys = Object.keys(inputObj).filter((key) => !(key in this.shape));

			if (extraKeys.length > 0) throw LeptonError.create(`Unrecognized key(s) in object: ${extraKeys.join(", ")}`);
		}

		const result: Partial<ObjectTypeOutput<T>> = {};
		for (const [key, schema] of Object.entries(this.shape)) {
			const isOptional = schema instanceof LeptonOptional;
			const typedKey = key as keyof T;

			if (!(key in input) && !isOptional) throw LeptonError.create(`Missing required property: ${key}`);
			if (key in input) {
				try {
					const inputObj = input as Record<string, unknown>;
					const value = inputObj[key];
					result[typedKey] = schema.parse(value);
				} catch (err) {
					if (err instanceof LeptonError) err.path = [key, ...err.path];
					throw err;
				}
			}
		}

		return result as ObjectTypeOutput<T>;
	}

	/**
	 * Serializes an object value according to the schema
	 * Format: [property1Value][property2Value]...
	 * @param value The object to encode
	 * @returns Hex string representation of the serialized object
	 */
	encode(value: Strict extends true ? ObjectTypeOutput<T> : Record<string, unknown>): string {
		let result = "";
		for (const [key, schema] of Object.entries(this.shape)) {
			const typedKey = key as keyof T;
			const fieldValue = (value as Record<keyof T, unknown>)[typedKey];
			result += schema.encode(fieldValue);
		}
		return result;
	}

	/**
	 * Raw decoding operation for objects that returns both the deserialized object and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedObject, remainingBytes]
	 * @throws {LeptonError} If decoding any property fails
	 */
	_rawDecode(bytes: string): [ObjectTypeOutput<T>, string] {
		const result: Partial<ObjectTypeOutput<T>> = {};
		let remaining = bytes;

		for (const [key, schema] of Object.entries(this.shape)) {
			const typedKey = key as keyof T;
			try {
				const [fieldValue, nextRemaining] = schema._rawDecode(remaining);
				result[typedKey] = fieldValue as unknown as ObjectTypeOutput<T>[typeof typedKey];
				remaining = nextRemaining;
			} catch (err) {
				if (err instanceof LeptonError) err.path = [key, ...err.path];
				throw err;
			}
		}

		return [result as ObjectTypeOutput<T>, remaining];
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

	/**
	 * Returns a new schema that will reject unknown keys during validation
	 * @returns A new object schema with strict validation enabled
	 */
	strict(): LeptonObject<T, true> {
		return new LeptonObject(this.shape, true);
	}

	/**
	 * Returns a new schema that extends this schema with additional properties
	 * @param shape Additional properties to add to the schema
	 * @returns A new object schema with the combined properties
	 */
	extend<U extends ObjectShape>(shape: U): LeptonObject<extendShape<T, U>> {
		return new LeptonObject(
			{
				...this.shape,
				...shape,
			},
			this.isStrict
		);
	}

	/**
	 * Returns a new schema with only the specified keys
	 * @param keys Array of keys to keep in the new schema
	 * @returns A new object schema with only the specified properties
	 */
	pick<K extends keyof T>(keys: readonly K[]): LeptonObject<Pick<T, K>> {
		const newShape: Partial<T> = {};
		for (const key of keys) {
			if (key in this.shape) newShape[key] = this.shape[key];
		}
		return new LeptonObject(newShape as Pick<T, K>, this.isStrict);
	}

	/**
	 * Returns a new schema without the specified keys
	 * @param keys Array of keys to exclude from the new schema
	 * @returns A new object schema without the specified properties
	 */
	omit<K extends keyof T>(keys: readonly K[]): LeptonObject<Omit<T, K>> {
		const keysSet = new Set(keys);
		const newShape: ObjectShape = {};

		for (const [key, schema] of Object.entries(this.shape)) {
			if (!keysSet.has(key as K)) newShape[key] = schema;
		}

		return new LeptonObject(newShape as unknown as Omit<T, K>, this.isStrict);
	}

	/**
	 * Merges this schema with another object schema
	 * @param schema Object schema to merge with
	 * @returns A new object schema with properties from both schemas
	 */
	merge<U extends ObjectShape>(schema: LeptonObject<U>): LeptonObject<MergeShapes<T, U>> {
		const newStrict = this.isStrict || schema.isStrict;
		return new LeptonObject(mergeShapes(this.shape, schema.shape), newStrict);
	}

	/**
	 * Makes all properties in the schema optional
	 * @returns A new object schema where all properties are optional
	 */
	partial(): LeptonObject<{[K in keyof T]: LeptonOptional<T[K]>}> {
		const newShape: ObjectShape = {};
		for (const [key, schema] of Object.entries(this.shape)) {
			if (!(schema instanceof LeptonOptional)) newShape[key] = schema.optional();
			else newShape[key] = schema;
		}
		return new LeptonObject(newShape as {[K in keyof T]: LeptonOptional<T[K]>}, this.isStrict);
	}
}

/**
 * Creates a schema for objects with the given property definitions
 * @param shape Object mapping property names to their schema types
 * @returns A new object schema
 * @example
 * const userSchema = lepton.object({
 *   id: lepton.int32(),
 *   name: lepton.string(),
 *   email: lepton.string().optional(),
 *   age: lepton.int8().optional()
 * });
 */
export function object<T extends ObjectShape>(shape: T): LeptonObject<T> {
	return new LeptonObject(shape);
}
