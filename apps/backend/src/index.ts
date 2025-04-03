import app from '@/lib/createServer.ts'
import { PORT } from '@/settings.ts'

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
