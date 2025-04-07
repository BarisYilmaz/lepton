import {LeptonError} from "../errors.ts";
import {LeptonType, TypeOf} from "../types.ts";
import {LeptonNullable} from "./nullable.ts";
import {LeptonArray} from "./array.ts";

/**
 * Implements an optional type for Lepton schemas
 * This wrapper allows a value to be either of the specified type or undefined
 * @template T The underlying type that can be optional
 */
export class LeptonOptional<T extends LeptonType<unknown, unknown>> extends LeptonType<TypeOf<T> | undefined, TypeOf<T> | undefined> {
	/** The schema for the wrapped type */
	private readonly wrappedType: T;

	/**
	 * Creates a new optional schema
	 * @param wrappedType The schema for the wrapped type
	 */
	constructor(wrappedType: T) {
		super();
		this.wrappedType = wrappedType;
	}

	/**
	 * Validates and transforms an input that can be undefined
	 * @param input The input to validate
	 * @returns Validated value or undefined if input is null/undefined
	 */
	parse(input: TypeOf<T> | undefined): TypeOf<T> | undefined {
		if (input === undefined) return undefined;
		return this.wrappedType.parse(input);
	}

	/**
	 * Serializes an optional value according to the schema
	 * Format: [presence flag][value if present]
	 * @param value The optional value to encode
	 * @returns Hex string representation of the serialized optional value
	 */
	encode(value: TypeOf<T> | undefined): string {
		if (value === undefined) return "00";
		return "01" + this.wrappedType.encode(value); // Presence flag + value
	}

	/**
	 * Raw decoding operation for optional values that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedValue, remainingBytes]
	 * @throws {LeptonError} If decoding fails
	 */
	_rawDecode(bytes: string): [TypeOf<T> | undefined, string] {
		if (bytes.length < 2) throw LeptonError.create("Not enough bytes to decode optional presence flag");

		const presenceFlag = parseInt(bytes.slice(0, 2), 16);
		const rest = bytes.slice(2);
		if (presenceFlag === 0) return [undefined, rest];

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

export function optional<T extends LeptonType<unknown, unknown>>(elementType: T): LeptonOptional<T> {
	return new LeptonOptional(elementType);
}
