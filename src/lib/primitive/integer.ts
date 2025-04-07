import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";

/**
 * Represents a fixed-width signed integer type in Lepton schemas
 * Supports 8-bit (-128 to 127), 16-bit (-32768 to 32767), and 32-bit (-2147483648 to 2147483647) integers
 */
export class LeptonSignedInt extends LeptonType<number, number> {
	private readonly width: number;
	private readonly minValue: number;
	private readonly maxValue: number;

	/**
	 * Creates a new fixed-width signed integer schema
	 * @param width Width of the integer in bytes (1, 2, or 4)
	 */
	constructor(width: number) {
		super();
		this.width = width;

		const bits = width * 8;
		this.minValue = -(2 ** (bits - 1));
		this.maxValue = 2 ** (bits - 1) - 1;
	}

	/**
	 * Validates that the input is a signed integer within the valid range
	 * @param input The input to validate
	 * @returns The validated integer
	 * @throws {LeptonError} If input is not an integer or outside valid range
	 */
	parse(input: number): number {
		if (typeof input !== "number" || !Number.isInteger(input)) throw LeptonError.create(`Expected integer, got ${typeof input}`);
		if (input < this.minValue || input > this.maxValue) throw LeptonError.create(`Value out of range for signed int${this.width * 8}: must be between ${this.minValue} and ${this.maxValue}`);
		return input;
	}

	/**
	 * Serializes a signed integer value according to the schema
	 * @param value The integer to encode
	 * @returns Hex string representation of the serialized integer
	 * @throws {LeptonError} If value is not an integer or outside valid range
	 */
	encode(value: number): string {
		if (typeof value !== "number" || !Number.isInteger(value)) throw LeptonError.create(`Expected integer, got ${typeof value}`);
		if (value < this.minValue || value > this.maxValue) throw LeptonError.create(`Value out of range for signed int${this.width * 8}: must be between ${this.minValue} and ${this.maxValue}`);

		if (value < 0) {
			const bits = this.width * 8;
			value = 2 ** bits + value;
		}
		return value.toString(16).padStart(this.width * 2, "0");
	}

	/**
	 * Raw decoding operation for signed integers that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedInteger, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the integer
	 */
	_rawDecode(bytes: string): [number, string] {
		if (bytes.length < this.width * 2) throw LeptonError.create(`Not enough bytes to decode int${this.width * 8}`);

		let value = parseInt(bytes.slice(0, this.width * 2), 16);

		// Check if the highest bit is set (negative number in two's complement)
		const bits = this.width * 8;
		const isNegative = (value & (1 << (bits - 1))) !== 0;

		// Convert back from two's complement for negative numbers
		if (isNegative) {
			value = value - 2 ** bits;
		}

		return [value, bytes.slice(this.width * 2)];
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
 * Represents a fixed-width unsigned integer type in Lepton schemas
 * Supports 8-bit (0 to 255), 16-bit (0 to 65535), and 32-bit (0 to 4294967295) integers
 */
export class LeptonUnsignedInt extends LeptonType<number, number> {
	/** Width of the integer in bytes (1, 2, or 4) */
	private readonly width: number;
	/** Maximum value representable with this byte width */
	private readonly maxValue: number;

	/**
	 * Creates a new fixed-width unsigned integer schema
	 * @param width Width of the integer in bytes (1, 2, or 4)
	 */
	constructor(width: number) {
		super();
		this.width = width;

		// Calculate range for unsigned integers
		const bits = width * 8;
		this.maxValue = 2 ** bits - 1;
	}

	/**
	 * Validates that the input is an unsigned integer within the valid range
	 * @param input The input to validate
	 * @returns The validated integer
	 * @throws {LeptonError} If input is not an integer or outside valid range
	 */
	parse(input: number): number {
		if (typeof input !== "number" || !Number.isInteger(input)) throw LeptonError.create(`Expected integer, got ${typeof input}`);
		if (input < 0 || input > this.maxValue) throw LeptonError.create(`Value out of range for unsigned uint${this.width * 8}: must be between 0 and ${this.maxValue}`);
		return input;
	}

	/**
	 * Serializes an unsigned integer value according to the schema
	 * @param value The integer to encode
	 * @returns Hex string representation of the serialized integer
	 * @throws {LeptonError} If value is not an integer or outside valid range
	 */
	encode(value: number): string {
		if (typeof value !== "number" || !Number.isInteger(value)) throw LeptonError.create(`Expected integer, got ${typeof value}`);
		if (value < 0 || value > this.maxValue) throw LeptonError.create(`Value out of range for unsigned uint${this.width * 8}: must be between 0 and ${this.maxValue}`);
		return value.toString(16).padStart(this.width * 2, "0");
	}

	/**
	 * Raw decoding operation for unsigned integers that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedInteger, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the integer
	 */
	_rawDecode(bytes: string): [number, string] {
		if (bytes.length < this.width * 2) throw LeptonError.create(`Not enough bytes to decode uint${this.width * 8}`);

		const value = parseInt(bytes.slice(0, this.width * 2), 16);
		return [value, bytes.slice(this.width * 2)];
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
 * Creates a schema for 8-bit signed integers (-128 to 127)
 * @returns A schema for 8-bit signed integers
 */
export function int8(): LeptonSignedInt {
	return new LeptonSignedInt(1);
}

/**
 * Creates a schema for 16-bit signed integers (-32768 to 32767)
 * @returns A schema for 16-bit signed integers
 */
export function int16(): LeptonSignedInt {
	return new LeptonSignedInt(2);
}
/**
 * Alias for int16()
 */
export {int16 as short};

/**
 * Creates a schema for 32-bit signed integers (-2147483648 to 2147483647)
 * @returns A schema for 32-bit signed integers
 */
export function int32(): LeptonSignedInt {
	return new LeptonSignedInt(4);
}

// Factory functions for unsigned integers

/**
 * Creates a schema for 8-bit unsigned integers (0 to 255)
 * @returns A schema for 8-bit unsigned integers
 */
export function uint8(): LeptonUnsignedInt {
	return new LeptonUnsignedInt(1);
}
/**
 * Alias for uint8()
 */
export {uint8 as byte};

/**
 * Creates a schema for 16-bit unsigned integers (0 to 65535)
 * @returns A schema for 16-bit unsigned integers
 */
export function uint16(): LeptonUnsignedInt {
	return new LeptonUnsignedInt(2);
}
/**
 * Alias for uint16()
 */
export {uint16 as ushort};

/**
 * Creates a schema for 32-bit unsigned integers (0 to 4294967295)
 * @returns A schema for 32-bit unsigned integers
 */
export function uint32(): LeptonUnsignedInt {
	return new LeptonUnsignedInt(4);
}
