/**
 * Encodes a BigInt value into a variable-length integer hex string
 * @param value The BigInt value to encode
 * @returns Hex string representation of the variable-length integer
 */
export function encodeVarInt(value: bigint): string {
	if (value === 0n) return "00";
	const bytes = [];
	while (value > 0n) {
		let byte = Number(value & 0x7fn);
		value >>= 7n;
		if (value > 0n) byte |= 0x80;
		bytes.push(byte.toString(16).padStart(2, "0"));
	}
	return bytes.join("");
}

/**
 * Rounds a number to the precision supported by a 32-bit float
 * @param value The number to round
 * @returns The rounded number
 */
export function roundToPrecision(value: number, precision: number): number {
	if (value === 0) return 0;

	const str = value.toString();
	if (str.includes(".")) {
		const [_, fracPart] = str.split(".");
		if (fracPart!.length > precision) return parseFloat(value.toFixed(precision));
	}

	return value;
}

/**
 * Decodes a variable-length integer from a hex string
 * @param encoded The hex string to decode
 * @returns A tuple containing the decoded BigInt value and the remaining hex string
 */
export function decodeVarInt(encoded: string): [bigint, string] {
	const bytes = [];
	let bytesUsed = 0;

	for (let i = 0; i < encoded.length; i += 2) {
		if (i >= encoded.length) break;

		const byte = parseInt(encoded.slice(i, i + 2), 16);
		bytes.push(byte);
		bytesUsed++;

		if ((byte & 0x80) === 0) break;
	}

	let value = 0n;
	let shift = 0n;
	for (const byte of bytes) {
		value |= BigInt(byte & 0x7f) << shift;
		shift += 7n;
	}
	return [value, encoded.slice(bytesUsed * 2)];
}

/*
zod <3
*/

/**
 * Utility type that merges the properties of two object types, with V overriding properties from U when they overlap
 */
export type MergeShapes<U, V> = {
	[k in Exclude<keyof U, keyof V>]: U[k];
} & V;

/**
 * Utility type that extracts keys from an object type where the value can be undefined
 */
type optionalKeys<T extends object> = {
	[k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];

/**
 * Utility type that extracts keys from an object type where the value cannot be undefined
 */
type requiredKeys<T extends object> = {
	[k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

/**
 * Utility type that adds question marks to optional properties in an object type
 */
export type addQuestionMarks<T extends object, _O = unknown> = {
	[K in requiredKeys<T>]: T[K];
} & {
	[K in optionalKeys<T>]?: T[K];
} & {
	[k in keyof T]?: unknown;
};

/**
 * Utility type that preserves type identity
 */
export type identity<T> = T;

/**
 * Utility type that flattens an object type
 */
export type flatten<T> = identity<{
	[k in keyof T]: T[k];
}>;

/**
 * Merges two objects, overriding properties from first with second when they overlap
 * @param first The first object
 * @param second The second object
 * @returns A new merged object
 */
export const mergeShapes = <U, T>(first: U, second: T): T & U => {
	return {...first, ...second} as T & U;
};

/**
 * Utility type that extends one object type with another, replacing overlapping properties with those from B
 */
export type extendShape<A extends object, B extends object> = {
	[K in keyof A as K extends keyof B ? never : K]: A[K];
} & {
	[K in keyof B]: B[K];
};
