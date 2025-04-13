import { server } from '@/lib/socket.ts'
import { PORT } from '@/settings.ts'

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
