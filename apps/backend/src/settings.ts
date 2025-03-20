import yaml from "yamljs";
import path from "path";

const PORT = process.env.PORT || 5100;
const swaggerDocs = yaml.load(path.join(import.meta.dirname, "./swagger.yaml"));

export { PORT, swaggerDocs };
