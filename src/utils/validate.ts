import { CreateRoomPayload, JoinChannelMessage, JoinRoomPayload } from "../common/interfaces";

export const validateCreateRoomPayload = (payload: CreateRoomPayload | JoinRoomPayload | JoinChannelMessage): void => {
  const { roomId, userName, password } = payload;

  const missingFields: string[] = [];

  if (!roomId) {
    missingFields.push('roomId');
  }
  if (!userName) {
    missingFields.push('userName');
  }
  if (!password) {
    missingFields.push('password');
  }

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}.`);
  }
};

// export const validateLoginUserPayload = (payload: LoginUserPayload): void => {
//   const { userName, password } = payload;

//   const missingFields: string[] = [];

//   if (!userName) {
//     missingFields.push('userName');
//   }
//   if (!password) {
//     missingFields.push('password');
//   }

//   if (missingFields.length > 0) {
//     throw new Error(`Missing required fields: ${missingFields.join(', ')}.`);
//   }

//   const userNameRegex = /^[a-z0-9_]+$/;
//   if (!userNameRegex.test(userName)) {
//     throw new Error('userName should contain only lowercase letters (a-z), digits (0-9), and underscores (_).');
//   }
// };
