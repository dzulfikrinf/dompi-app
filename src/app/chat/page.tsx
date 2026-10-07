import { requireAuthUser } from "@/lib/auth"
import ChatClient from "./chat-client"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const user = await requireAuthUser()

  return <ChatClient userEmail={user.email} />
}
