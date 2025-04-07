# Lepton

Lepton is a lightweight TypeScript binary serialization & schema validation library inspired by zod. It provides a powerful API for defining schemas that can validate data and serialize/deserialize values to and from compact binary representations.

## Basic Usage

```typescript
import {lepton} from "@hadron/lepton";

// Define a schema for a user object
const userSchema = lepton.object({
	id: lepton.int32(),
	name: lepton.string(),
	email: lepton.string(),
	age: lepton.int8().optional(),
	tags: lepton.string().array(),
});

// Type inference works automatically
type User = lepton.infer<typeof userSchema>;

// Validate data against the schema
const user = userSchema.parse({
	id: 1234,
	name: "John Doe",
	email: "john@example.com",
	tags: ["developer", "typescript"],
});

// Serialize to binary format (as hex string)
const encoded = userSchema.encode(user);
console.log("Encoded:", encoded);

// Deserialize from binary format
const decoded = userSchema.decode(encoded);
console.log("Decoded:", decoded);
```

## Available Types

### Primitives

- `int8()`, `int16()`, `int32()`: Fixed-width integers
- `varint()`, `bigint()`: Variable-length big integers
- `float()`: 32-bit floating point number
- `double()`: 64-bit floating point number
- `string()`: UTF-8 string
- `bits(width)`: Bit-width specific integers (1-32 bits)
- `nibble()`, `uint4()`: 4-bit integers (0-15)

### Object Types

```typescript
// Define an object schema
const personSchema = lepton.object({
	name: lepton.string(),
	age: lepton.int8(),
});

// Create a strict schema (rejects unknown properties)
const strictSchema = personSchema.strict();

// Extend an existing schema
const employeeSchema = personSchema.extend({
	employeeId: lepton.int32(),
	department: lepton.string(),
});

// Pick specific properties
const basicInfoSchema = personSchema.pick(["name"]);

// Omit specific properties
const namelessSchema = personSchema.omit(["name"]);

// Merge schemas
const combinedSchema = personSchema.merge(otherSchema);

// Make all properties optional
const partialSchema = personSchema.partial();
```

```typescript
// Optional types (value or undefined)
const optionalAge = lepton.int8().optional();

// Nullable types (value or null)
const nullableName = lepton.string().nullable();

// Array types
const tagList = lepton.string().array();

// Combination of optional and array
const optionalTagList = lepton.string().array().optional();
```

## Advanced Example

```typescript
import {lepton} from "@hadron/lepton";

// Define a complex nested schema
const buildSchema = lepton.object({
	version: lepton.int8(),
	weaponId: lepton.int8(),
	weaponLevel: lepton.bigint().optional(),
	skills: lepton
		.object({
			id: lepton.int8(),
			level: lepton.varint(),
		})
		.array(),
});

// The type is inferred automatically
type BuildType = lepton.infer<typeof buildSchema>;

// Create data that conforms to the schema
const build = {
	version: 1,
	weaponId: 1,
	weaponLevel: 1n,
	skills: [
		{
			id: 1,
			level: 123456789n,
		},
	],
};

// Serialize to binary format
const encoded = buildSchema.encode(build);
console.log("Encoded:", encoded);

// Deserialize from binary format
const decoded = buildSchema.decode(encoded);
console.log("Decoded:", decoded);
```

## Contributing

We welcome contributions to this project! If you would like to contribute, please follow these guidelines:

1. **Fork this repository:** Create a personal fork of the repository on GitHub.
2. **Clone the fork:** Clone the fork to your local machine and add the upstream repository as a remote.
   ```bash
   git clone https://github.com/BarisYilmaz/lepton.git
   ```
3. Create a branch: Create a new branch for your changes.
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes: Implement your changes in the new branch.
5. Commit your changes: Commit your changes with a descriptive commit message.
   ```bash
   git commit -m "Description of your changes"
   ```
6. Push to your fork: Push your changes to your forked repository.
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a Pull Request: Open a pull request from your branch to the main repository's main branch. Provide a clear description of your changes and any relevant information.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/BarisYilmaz/lepton/blob/master/LICENSE) file for details.
