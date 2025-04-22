const fs = require("fs");
const { version } = require("../package.json");
const jsr = require("../jsr.json");
const path = require("path");

jsr["version"] = version;
fs.writeFileSync(
	path.resolve(__dirname, "../jsr.json"),
	JSON.stringify(jsr, null, "\t") + "\r\n"
);
console.log(`Updated JSR version to ${version}`);
