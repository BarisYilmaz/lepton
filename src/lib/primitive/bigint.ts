import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";
import {decodeVarInt, encodeVarInt} from "../../utils.ts";

export class LeptonBigInt extends LeptonType<bigint, bigint> {
	/**
	 * Validates that the input is a BigInt
	 * @param input The input to validate
	 * @returns The validated BigInt
	 * @throws {LeptonError} If input is not a BigInt
	 */
	parse(input: bigint): bigint {
		if (typeof input !== "bigint") throw LeptonError.create(`Expected bigint, got ${typeof input}`);
		return input;
	}

	/**
	 * Serializes a BigInt value using variable-length encoding
	 * @param value The BigInt to encode
	 * @returns Hex string representation of the serialized BigInt
	 * @throws {LeptonError} If value is not a BigInt
	 */
	encode(value: bigint): string {
		if (typeof value !== "bigint") throw LeptonError.create(`Expected bigint, got ${typeof value}`);
		return encodeVarInt(value);
	}

	/**
	 * Raw decoding operation for BigInts that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedBigInt, remainingBytes]
	 */
	_rawDecode(bytes: string): [bigint, string] {
		return decodeVarInt(bytes);
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
 * Creates a schema for big integers
 * @returns A schema for big integers
 */
export function bigint(): LeptonBigInt {
	return new LeptonBigInt();
}
