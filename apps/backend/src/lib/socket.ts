import app from '@/lib/createServer.ts'
import { createServer } from 'http'
import { Server } from 'socket.io'

export const server = createServer(app)
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', () => {
    console.log('a user disconnected')
  })

  socket.on('message', (message) => {
    console.log('message: ', message)
  })
})
