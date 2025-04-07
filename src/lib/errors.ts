export type LeptonIssue = {
	path: string[];
	message: string;
};
export class LeptonError extends Error {
	path: string[];
	issues: LeptonIssue[];

	/**
	 * Creates a new LeptonError
	 * @param message Error message describing what went wrong
	 * @param path Optional path to the location where the error occurred
	 */
	constructor(message: string, path: string[] = []) {
		super(message);
		this.name = "LeptonError";
		this.path = path;
		this.issues = [{path, message}];
	}

	/**
	 * Factory method to create a new LeptonError
	 * @param message Error message describing what went wrong
	 * @param path Optional path to the location where the error occurred
	 * @returns A new LeptonError instance
	 */
	static create(message: string, path: string[] = []): LeptonError {
		return new LeptonError(message, path);
	}
}
