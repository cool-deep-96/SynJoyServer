import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Date, Types } from "mongoose";

enum Source {
  YOUTUBE = "youtube",
  FILE = "file",
}

enum EventType {
  JOINING_REQUEST = "joiningRequest",
  JOINING_RESPONSE = "joiningResponse",
  JOIN_ROOM = "joinRoom",
  PAUSE = "pause",
  PLAY = "play",
  VIDEO_ID = "videoId",
  ROOM_MESSAGE = "roomMessage",
}

interface JoinChannelMessage {
  roomId: string;
  userName: string;
  password: string;
}

interface JoinChannelResponse {
  message: string;
  payload: {
    id: string;
    roomId: string;
    userName: string;
  };
}

interface VideoSyncChannelMessage {
  eventType: EventType;
  source?: Source;
  requestDuration?: number;
  youtubeVideoId?: string;
  userName: string;
  roomId?: string;
}

enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
}
interface MessageBox {
  message: string;
  sentBy: string;
  status: MessageStatus;
}

interface CreateRoomPayload {
  roomId: string;
  userName: string;
  password: string;
}
interface JoinRoomPayload {
  roomId: string;
  userName: string;
  password: string;
}

interface CreateChatPayload {
  message: string;
  roomId: string;
  userId: string;
}

interface TokenData {
  id: string;
  userName: string;
  roomId: string;
  expireAt: Date;
  isMember: boolean;
  isOwner: boolean;
}

interface CustomRequest extends Request {
  user?: string | TokenData | JwtPayload;
}

interface Member {
  id: string;
  userName: string;
  roomId?: string;
  isMember: boolean;
  isOwner: boolean;
}

interface Message {
  id: string;
  sentById: string;
  sentByUserName: string;
  text: string;
  time: number;
  isRemoved: boolean;
}

export interface SycVideoPayload {
  source: Source;
  currentTime: number;
  isPlaying: boolean;
  tokenData?: TokenData;
  url?: string;
}

export {
  TokenData,
  JoinChannelMessage,
  CreateChatPayload,
  VideoSyncChannelMessage,
  Source,
  CustomRequest,
  JoinChannelResponse,
  EventType,
  MessageBox,
  MessageStatus,
  CreateRoomPayload,
  JoinRoomPayload,
  Member,
  Message,
};
