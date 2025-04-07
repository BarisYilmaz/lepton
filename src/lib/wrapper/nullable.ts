import {LeptonError} from "../errors.ts";
import {LeptonType, type TypeOf} from "../types.ts";
import {LeptonArray} from "./array.ts";
import {LeptonOptional} from "./optional.ts";

/**
 * Implements a nullable type for Lepton schemas
 * This wrapper allows a value to be either of the specified type or null
 * @template T The underlying type that can be null
 */
export class LeptonNullable<T extends LeptonType<unknown, unknown>> extends LeptonType<TypeOf<T> | null, TypeOf<T> | null> {
	private readonly wrappedType: T;

	/**
	 * Creates a new nullable schema
	 * @param wrappedType The schema for the wrapped type
	 */
	constructor(wrappedType: T) {
		super();
		this.wrappedType = wrappedType;
	}

	/**
	 * Validates and transforms an input that can be null
	 * @param input The input to validate
	 * @returns Validated value or null if input is null
	 */
	parse(input: TypeOf<T> | null): TypeOf<T> | null {
		if (input === null) return null;
		return this.wrappedType.parse(input);
	}

	/**
	 * Serializes a nullable value according to the schema
	 * Format: [null flag][value if not null]
	 * @param value The nullable value to encode
	 * @returns Hex string representation of the serialized nullable value
	 */
	encode(value: TypeOf<T> | null): string {
		// Null flag: is null
		if (value === null) return "01";
		return "00" + this.wrappedType.encode(value); // Null flag + value
	}

	/**
	 * Raw decoding operation for nullable values that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedValue, remainingBytes]
	 * @throws {LeptonError} If decoding fails
	 */
	_rawDecode(bytes: string): [TypeOf<T> | null, string] {
		if (bytes.length < 2) throw LeptonError.create("Not enough bytes to decode nullable flag");

		const nullFlag = parseInt(bytes.slice(0, 2), 16);
		const rest = bytes.slice(2);

		if (nullFlag === 1) return [null, rest];
		return this.wrappedType._rawDecode(rest);
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

export function nullable<T extends LeptonType<unknown, unknown>>(elementType: T): LeptonNullable<T> {
	return new LeptonNullable(elementType);
}
