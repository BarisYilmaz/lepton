import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";
import {roundToPrecision} from "../../utils.ts";

/**
 * Represents a 32-bit floating point number type in Lepton schemas
 * Floats are encoded using IEEE 754 single-precision format
 */
export class LeptonFloat extends LeptonType<number, number> {
	/** Maximum number of decimal places to preserve during serialization */
	private readonly precision: number = 7;

	/**
	 * Validates that the input is a number
	 * @param input The input to validate
	 * @returns The validated number, rounded to the float precision
	 * @throws {LeptonError} If input is not a number
	 */
	parse(input: number): number {
		if (typeof input !== "number") throw LeptonError.create(`Expected number, got ${typeof input}`);
		return roundToPrecision(input, this.precision);
	}

	/**
	 * Serializes a float value using IEEE 754 single-precision format
	 * @param value The number to encode
	 * @returns Hex string representation of the serialized float
	 */
	encode(value: number): string {
		value = roundToPrecision(value, this.precision);

		const buffer = new ArrayBuffer(4);
		const view = new DataView(buffer);
		view.setFloat32(0, value, false);

		let result = "";
		for (let i = 0; i < 4; i++) {
			result += view.getUint8(i).toString(16).padStart(2, "0");
		}
		return result;
	}

	/**
	 * Raw decoding operation for floats that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedFloat, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the float
	 */
	_rawDecode(bytes: string): [number, string] {
		if (bytes.length < 8) throw LeptonError.create(`Not enough bytes to decode float`);

		const buffer = new ArrayBuffer(4);
		const view = new DataView(buffer);

		for (let i = 0; i < 4; i++) {
			const byteValue = parseInt(bytes.slice(i * 2, i * 2 + 2), 16);
			view.setUint8(i, byteValue);
		}

		const value = view.getFloat32(0, false);
		return [roundToPrecision(value, this.precision), bytes.slice(8)];
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
 * Creates a schema for 32-bit floating point numbers
 * @returns A schema for 32-bit floats
 */
export function float(): LeptonFloat {
	return new LeptonFloat();
}
