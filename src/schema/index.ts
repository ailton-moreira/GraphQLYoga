/* import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeDefinitions = readFileSync(join(__dirname, "schema.graphql"), {
  encoding: "utf-8",
});

export default typeDefinitions;
 */

import { readFileSync } from "fs";
import { join } from "path";

const typeDefs = readFileSync(
  join(process.cwd(), "src/schema/schema.graphql"),
  "utf8"
);

export default typeDefs;
