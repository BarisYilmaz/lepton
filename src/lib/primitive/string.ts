import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";
import {decodeVarInt, encodeVarInt} from "../../utils.ts";

/**
 * Represents a string type in Lepton schemas
 * Strings are encoded as UTF-8 with a length prefix
 */
export class LeptonString extends LeptonType<string, string> {
	/**
	 * Validates that the input is a string
	 * @param input The input to validate
	 * @returns The validated string
	 * @throws {LeptonError} If input is not a string
	 */
	parse(input: string): string {
		if (typeof input !== "string") throw LeptonError.create(`Expected string, got ${typeof input}`);
		return input;
	}

	/**
	 * Serializes a string value as UTF-8 with length prefix
	 * @param value The string to encode
	 * @returns Hex string representation of the serialized string
	 */
	encode(value: string): string {
		const utf8Bytes = new TextEncoder().encode(value);
		let result = encodeVarInt(BigInt(utf8Bytes.length));
		utf8Bytes.forEach((byte) => {
			result += byte.toString(16).padStart(2, "0");
		});
		return result;
	}

	/**
	 * Raw decoding operation for strings that returns both the deserialized value and the remaining bytes
	 * @param bytes Hex string to decode
	 * @returns Tuple of [deserializedString, remainingBytes]
	 * @throws {LeptonError} If not enough bytes are available to decode the string
	 */
	_rawDecode(bytes: string): [string, string] {
		const [length, rest] = decodeVarInt(bytes);
		const strLength = Number(length);

		if (rest.length < strLength * 2) throw LeptonError.create(`Not enough bytes to decode string of length ${strLength}`);

		const strBytes = new Uint8Array(strLength);
		for (let i = 0; i < strLength; i++) {
			strBytes[i] = parseInt(rest.slice(i * 2, i * 2 + 2), 16);
		}

		const value = new TextDecoder().decode(strBytes);
		return [value, rest.slice(strLength * 2)];
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
 * Creates a schema for UTF-8 strings
 * @returns A schema for UTF-8 strings
 */
export function string(): LeptonString {
	return new LeptonString();
}
