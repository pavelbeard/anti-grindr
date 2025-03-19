import { User, TestUser } from "./user";

type Message = {
  id: string;
  senderId: User["id"];
  receiverId: User["id"];
  content: string;
  createdAt: string;
  updatedAt: string;
};

type TestMessage = {
  id: string;
  senderId: TestUser["id"];
  receiverId: TestUser["id"];
  content: string;
  createdAt: string;
  updatedAt: string;
};

export { Message, TestMessage };
