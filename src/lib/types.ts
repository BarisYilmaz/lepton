import type {LeptonOptional, LeptonNullable, LeptonArray} from "./wrapper/wrappers.ts";

/**
 * Utility type to extract the output type of a Lepton schema
 * @template T The Lepton schema type to extract from
 */
export type TypeOf<T extends LeptonType<unknown, unknown>> = T["_output"];

/**
 * Alternative name for TypeOf
 */
export type {TypeOf as infer};

/**
 * Type representing any Lepton type
 */
export type LeptonTypeAny = LeptonType<unknown, unknown>;

/**
 * Base abstract class for Lepton schema types
 * @template Output The TypeScript type that this schema outputs
 */
export abstract class LeptonType<Input, Output> {
	/** The TypeScript type that this schema outputs */
	readonly _input!: Input;
	readonly _output!: Output;

	abstract parse(input: this["_input"]): this["_output"];
	abstract encode(value: this["_output"]): string;
	abstract _rawDecode(bytes: string): [this["_output"], string];

	parseUnsafe(input: unknown): this["_output"] {
		return this.parse(input as unknown as Input);
	}

	/**
	 * Deserializes a hex string to recover a value according to the schema
	 * @param bytes Hex string to decode
	 * @returns The deserialized value
	 */
	decode(bytes: string): this["_output"] {
		const [value, _] = this._rawDecode(bytes);
		return this.parse(value as unknown as this["_input"]);
	}

	abstract optional(): LeptonOptional<this>;
	abstract nullable(): LeptonNullable<this>;
	abstract array(): LeptonArray<this>;
}
