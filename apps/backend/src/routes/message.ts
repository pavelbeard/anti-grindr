import Router from "express";
import { Request, Response } from "express";
import { TestMessage } from "@/types/message";

const messages: TestMessage[] = [];

const router = Router();

router.post("/send", (req: Request, res: Response) => {
  const { senderId, receiverId, content } = req.body;

  const message: TestMessage = {
    id: Math.random().toString(36).slice(2, 9),
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  messages.push(message);
  res.status(201).json(message);
});

router.get("/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;

  const userMessages = messages.filter(
    (message) => message.senderId === userId || message.receiverId === userId
  );

  res.status(200).json(userMessages);
});

export default router;
