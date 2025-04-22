import * as lepton from "./lib/lepton.ts";
/**
 * @module
 * Lepton - A TypeScript schema validation and binary serialization library
 *
 * Lepton provides a powerful API for defining schemas that can validate data
 * and serialize/deserialize values to and from binary representations.
 *
 * @example
 * ```typescript
 * import { lepton } from './index';
 *
 * // Define a schema for a user object
 * const userSchema = lepton.object({
 *   id: lepton.int32(),
 *   name: lepton.string(),
 *   email: lepton.string(),
 *   age: lepton.int8().optional(),
 *   tags: lepton.string().array()
 * });
 *
 * // Type inference works automatically
 * type User = lepton.infer<typeof userSchema>;
 *
 * // Validate data against the schema
 * const user = userSchema.parse({
 *   id: 1234,
 *   name: "John Doe",
 *   email: "john@example.com",
 *   tags: ["developer", "typescript"]
 * });
 *
 * // Serialize to binary format (as hex string)
 * const encoded = userSchema.encode(user);
 *
 * // Deserialize from binary format
 * const decoded = userSchema.decode(encoded);
 * ```
 */
export {lepton};
