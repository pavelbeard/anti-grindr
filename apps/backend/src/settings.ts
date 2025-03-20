import path from "path";
import { fileURLToPath } from "url";
import yaml from "yamljs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5100;
const swaggerDocs = yaml.load(path.join(__dirname, "./swagger.yaml"));

export { PORT, swaggerDocs };
