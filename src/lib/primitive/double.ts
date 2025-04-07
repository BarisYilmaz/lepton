import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";

/**
 * Represents a 64-bit floating point number type in Lepton schemas
 * Doubles are encoded using IEEE 754 double-precision format
 */
export class LeptonDouble extends LeptonType<number, number> {
	/**
	 * Validates that the input is a number
	 * @param input The input to validate
	 * @returns The validated number
	 * @throws {LeptonError} If input is not a number
	 */
	parse(input: number): number {
		if (typeof input !== "number") throw LeptonError.create(`Expected number, got ${typeof input}`);
		return input;
	}

	/**
	 * Serializes a double value using IEEE 754 double-precision format
	 * @param value The number to encode
	 * @returns Hex string representation of the serialized double
	 */
	encode(value: number): string {
		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);
		view.setFloat64(0, value, false);

		let result = "";
		for (let i = 0; i < 8; i++) {
			result += view.getUint8(i).toString(16).padStart(2, "0");
		}
		return result;
	}

	/**
	 * Raw decoding operation for doubles that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedDouble, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the double
	 */
	_rawDecode(bytes: string): [number, string] {
		if (bytes.length < 16) throw LeptonError.create(`Not enough bytes to decode double`);

		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);

		for (let i = 0; i < 8; i++) {
			const byteValue = parseInt(bytes.slice(i * 2, i * 2 + 2), 16);
			view.setUint8(i, byteValue);
		}

		const value = view.getFloat64(0, false);
		return [value, bytes.slice(16)];
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
 * Creates a schema for 64-bit floating point numbers
 * @returns A schema for 64-bit doubles
 */
export function double(): LeptonDouble {
	return new LeptonDouble();
}
