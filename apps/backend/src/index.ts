import { PORT } from "@/settings.ts";
import { server } from "@/lib/socket.ts";

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
