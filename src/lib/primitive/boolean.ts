import {LeptonError} from "../errors.ts";
import {LeptonOptional, LeptonNullable, LeptonArray} from "../wrapper/wrappers.ts";
import {LeptonType} from "../types.ts";

export class LeptonBoolean extends LeptonType<boolean, boolean> {
	/**
	 * Validates that the input is a boolean
	 * @param input The input to validate
	 * @returns The validated boolean value (0 or 1)
	 * @throws {LeptonError} If input is not a boolean
	 */
	parse(input: boolean): boolean {
		if (typeof input !== "boolean") throw LeptonError.create(`Expected boolean, got ${typeof input}`);
		return input ? true : false;
	}

	/**
	 * Serializes a boolean value as 0 or 1
	 * @param value The boolean to encode
	 * @returns Hex string representation of the serialized boolean
	 */
	encode(value: boolean): string {
		if (typeof value !== "boolean") throw LeptonError.create(`Expected boolean, got ${typeof value}`);
		return (+value).toString(16).padStart(2, "0");
	}

	_rawDecode(bytes: string): [boolean, string] {
		if (bytes.length < 2) throw LeptonError.create(`Not enough bytes to decode boolean`);
		const value = parseInt(bytes.slice(0, 2), 16);
		return [!!value, bytes.slice(2)];
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
 * Creates a schema for boolean values (0 or 1)
 * @returns A schema for boolean values
 */
export function boolean(): LeptonBoolean {
	return new LeptonBoolean();
}
