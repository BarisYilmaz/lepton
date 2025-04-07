import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";

/**
 * Represents an n-bit integer type in Lepton schemas, where n is between 1 and 32
 * Useful for efficiently encoding small numbers like flags or enums
 */
export class LeptonBits extends LeptonType<number, number> {
	/** Width of the integer in bits (1-32) */
	private readonly bitWidth: number;
	/** Maximum value representable with this bit width */
	private readonly maxValue: number;

	/**
	 * Creates a new bit-width-specific integer schema
	 * @param bitWidth Width of the integer in bits (1-32)
	 * @throws {Error} If bitWidth is not between 1 and 32
	 */
	constructor(bitWidth: number) {
		super();
		if (bitWidth <= 0 || bitWidth > 32) throw LeptonError.create(`Bit width must be between 1 and 32, got ${bitWidth}`);
		this.bitWidth = bitWidth;
		this.maxValue = (1 << bitWidth) - 1;
	}

	/**
	 * Validates that the input is an integer within the valid range for this bit width
	 * @param input The input to validate
	 * @returns The validated integer
	 * @throws {LeptonError} If input is not an integer or is outside the valid range
	 */
	parse(input: number): number {
		if (typeof input !== "number" || !Number.isInteger(input)) throw LeptonError.create(`Expected integer, got ${typeof input}`);
		if (input < 0 || input > this.maxValue) throw LeptonError.create(`Value out of range for ${this.bitWidth}-bit integer: must be between 0 and ${this.maxValue}`);
		return input;
	}

	/**
	 * Serializes a bit-width-specific integer value
	 * @param value The integer to encode
	 * @returns Hex string representation of the serialized integer
	 * @throws {LeptonError} If value is not an integer or is outside the valid range
	 */
	encode(value: number): string {
		if (typeof value !== "number" || !Number.isInteger(value)) throw LeptonError.create(`Expected integer, got ${typeof value}`);
		if (value < 0 || value > this.maxValue) throw LeptonError.create(`Value out of range for ${this.bitWidth}-bit integer: must be between 0 and ${this.maxValue}`);

		const bytesNeeded = Math.ceil(this.bitWidth / 8);
		let result = "";
		for (let i = 0; i < bytesNeeded; i++) {
			const shift = Math.max(0, (bytesNeeded - i - 1) * 8);
			const byteValue = (value >> shift) & 0xff;
			result += byteValue.toString(16).padStart(2, "0");
		}
		return result;
	}

	/**
	 * Raw decoding operation for bit-width-specific integers that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedInteger, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the integer
	 */
	_rawDecode(bytes: string): [number, string] {
		const bytesNeeded = Math.ceil(this.bitWidth / 8);
		if (bytes.length < bytesNeeded * 2) throw LeptonError.create(`Not enough bytes to decode ${this.bitWidth}-bit integer`);

		let value = 0;
		for (let i = 0; i < bytesNeeded; i++) {
			const byteValue = parseInt(bytes.slice(i * 2, i * 2 + 2), 16);
			value = (value << 8) | byteValue;
		}

		if (this.bitWidth % 8 !== 0) value = value & ((1 << this.bitWidth) - 1);
		return [value, bytes.slice(bytesNeeded * 2)];
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
 * Creates a schema for bit-width-specific integers (1-32 bits)
 * @param width Number of bits to use (1-32)
 * @returns A schema for the specified bit width integers
 */
export function bits(width: number): LeptonBits {
	return new LeptonBits(width);
}

/**
 * Creates a schema for 4-bit integers (0-15)
 * Useful for small enums or flags
 * @returns A schema for 4-bit integers
 */
export function nibble(): LeptonBits {
	return bits(4);
}
/**
 * Alias for nibble()
 */
export {nibble as uint4};
