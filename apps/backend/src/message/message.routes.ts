import type { Request, Response } from 'express'
import { Router } from 'express'

interface TestMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
  updatedAt: string
}

const messages: TestMessage[] = []

const messageRouter: Router = Router()

messageRouter.post('/send', (req: Request, res: Response) => {
  const { senderId, receiverId, content } = req.body

  const message: TestMessage = {
    id: Math.random().toString(36).slice(2, 9),
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  messages.push(message)
  res.status(201).json(message)
})

messageRouter.get('/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId

  const userMessages = messages.filter(
    (message) => message.senderId === userId || message.receiverId === userId
  )

  res.status(200).json(userMessages)
})

export default messageRouter
