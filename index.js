import Server from "./src/server.js";
import { env } from "custom-env";

env() // getting envirnoment variables
const PORT = process.env.PORT;
const server = new Server().app;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
