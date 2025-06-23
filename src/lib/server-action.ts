"use server";

import { friendValidator } from "@/validators/friend-validator";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { z as zod } from "zod";
import { Message } from "@/types/db.t";
import { messageValidator } from "@/validators/message";
import { User } from "next-auth";
import { nanoid } from "nanoid";
import { toPusherKey } from "./utils";
import { pusherServer } from "./pusher";

export interface LoginResult {
  error?: string;
  success?: string;
}

export interface FriendResult {
  error?: string;
  success?: string;
}

export const loginCredentials = async (
  _prev: LoginResult | null,
  formData: FormData
): Promise<LoginResult> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  console.log(email, password);
  return { error: "Only google auth supported for now" };
};

export const addFriend = async (
  _prev: FriendResult | null,
  formData: FormData
): Promise<FriendResult> => {
  try {
    const email = formData.get("email");
    if (!email) return { error: "Email is required" };

    const { email: emailToAdd } = friendValidator.parse({ email });

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd || typeof idToAdd !== "string") {
      return { error: "This person does not exist" };
    }

    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId || !userEmail) {
      return { error: "Unauthorized" };
    }

    if (userId === idToAdd) {
      return { error: "You cannot add yourself as a friend" };
    }

    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      userId
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return { error: "Already added this user" };
    }

    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${userId}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return { error: "Already friends with this user" };
    }

    // Send real-time update
    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: userId,
        senderEmail: userEmail,
      }
    );

    // Update Redis
    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, userId);

    return { success: "Friend request sent" };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong" };
  }
};

export async function acceptFriend(
  idToAdd: string
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await auth();

    if (!session) return { error: "Unauthorized" };

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) return { error: "Already friends" };

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) return { error: "No friend request" };

    // Get both users
    const [rawCurrentUser, rawFriendUser] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const currentUserData = JSON.parse(rawCurrentUser);
    const friendUserData = JSON.parse(rawFriendUser);

    // Create proper User objects (id, email, name, image)
    const currentUser: User = {
      id: session.user.id,
      email: session.user.email,
      name: currentUserData.name ?? "Unnamed",
      image: currentUserData.image ?? "",
    };

    const friendUser: User = {
      id: idToAdd,
      email: friendUserData.email,
      name: friendUserData.name ?? "Unnamed",
      image: friendUserData.image ?? "",
    };

    // Trigger Pusher events for both users
    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        currentUser
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friendUser
      ),
      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ]);

    return { success: "Friend added successfully" };
  } catch (err) {
    console.error(err);
    return { error: "Something went wrong" };
  }
}


export async function denyFriend(
  idToDeny: string
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await auth();

    if (!session) {
      return { error: "Unauthorized" };
    }

    const { id } = zod.object({ id: zod.string() }).parse({ id: idToDeny });

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, id);

    return { success: "Friend request denied" };
  } catch (error) {
    console.error(error);
    if (error instanceof zod.ZodError) {
      return { error: "Invalid ID" };
    }

    return { error: "Something went wrong" };
  }
}

export const sendMessage = async (chatId: string, text: string) => {
  try {
    const session = await auth()

    if (!session) throw new Error("Unauthorized");

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      throw new Error("Unauthorized");
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    if (!friendList.includes(friendId)) {
      throw new Error("Unauthorized");
    }

    const rawSender = await fetchRedis("get", `user:${session.user.id}`);
    const sender = JSON.parse(rawSender as string) as User;

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      receiverId:friendId,
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`chat:${chatId}`),
        "incoming-message",
        message
      ),
      pusherServer.trigger(
        toPusherKey(`user:${friendId}:chats`),
        "new_message",
        {
          ...message,
          senderImg: sender.image,
          senderName: sender.name,
        }
      ),
      db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: JSON.stringify(message),
      }),
    ]);

    return { success: "Message sent." };
  } catch (error) {
    console.log(error)
    return { error: "Failed to send message." };
  }
};
