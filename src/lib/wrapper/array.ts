import {decodeVarInt, encodeVarInt} from "../../utils.ts";
import {LeptonError} from "../errors.ts";
import {LeptonType, TypeOf} from "../types.ts";
import {LeptonNullable} from "./nullable.ts";
import {LeptonOptional} from "./optional.ts";

/**
 * Implements an array type for Lepton schemas
 * This wrapper allows you to create arrays of any Lepton type
 * @template T The element type for the array
 */
export class LeptonArray<T extends LeptonType<unknown, unknown>> extends LeptonType<TypeOf<T>[], TypeOf<T>[]> {
	/** The schema type for elements in this array */
	private readonly elementType: T;

	/**
	 * Creates a new array schema
	 * @param elementType The schema for elements in this array
	 */
	constructor(elementType: T) {
		super();
		this.elementType = elementType;
	}

	/**
	 * Validates and transforms an array input according to the schema
	 * @param input The input to validate
	 * @returns Array of validated elements
	 * @throws {LeptonError} If validation fails or input is not an array
	 */
	parse(input: TypeOf<T>[]): TypeOf<T>[] {
		if (!Array.isArray(input)) throw LeptonError.create(`Expected array, got ${typeof input}`);
		const result: TypeOf<T>[] = [];
		for (let i = 0; i < input.length; i++) {
			try {
				result.push(this.elementType.parse(input[i]));
			} catch (err) {
				if (err instanceof LeptonError) {
					err.path = [`${i}`, ...err.path];
					throw err;
				}
				throw err;
			}
		}
		return result;
	}

	/**
	 * Serializes an array value according to the schema
	 * Format: [length][element1][element2]...
	 * @param value The array to encode
	 * @returns Hex string representation of the serialized array
	 */
	encode(value: TypeOf<T>[]): string {
		let result = encodeVarInt(BigInt(value.length));
		for (const element of value) result += this.elementType.encode(element);
		return result;
	}

	/**
	 * Raw decoding operation for arrays that returns both the deserialized array and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedArray, remainingBytes]
	 * @throws {LeptonError} If decoding fails
	 */
	_rawDecode(bytes: string): [TypeOf<T>[], string] {
		const [length, rest] = decodeVarInt(bytes);
		const arrayLength = Number(length);

		const result: TypeOf<T>[] = [];
		let remaining = rest;

		for (let i = 0; i < arrayLength; i++) {
			try {
				const [element, nextRemaining] = this.elementType._rawDecode(remaining);
				result.push(element);
				remaining = nextRemaining;
			} catch (err) {
				if (err instanceof LeptonError) {
					err.path = [`${i}`, ...err.path];
					throw err;
				}
				throw err;
			}
		}

		return [result, remaining];
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
}

/**
 * Creates a schema for arrays.
 * Can be used with or without a type parameter:
 * - array(lepton.string()) - creates an array schema for strings
 *
 * @param elementType Optional schema for the element type (defaults to any)
 * @returns A schema for arrays of the specified type
 */
export function array<T extends LeptonType<unknown, unknown>>(elementType: T): LeptonArray<T> {
	// if (!elementType) return new LeptonArray(any() as unknown as T);
	return new LeptonArray(elementType);
}
