import { Types } from "mongoose";
import User, { IUser } from "../models/User.model";

export const getUserService = async (
  userName: string
): Promise<IUser | null> => {
  const userDb = await User.findOne({ userName });
  return userDb || null;
};

export const createUserService = async (
  userName: string,
  password: string,
  expireAt?: Date
): Promise<IUser> => {
  const newUser = new User({
    userName,
    password,
    expireAt: expireAt || new Date(Date.now() + 24 * 3600 * 1000),
  });
  const user = await newUser.save();
  return user;
};

export const updateExpireAtUserService = async (
  userId: Types.ObjectId,
  expireAt: Date
): Promise<IUser> => {
  const userDb = await User.findByIdAndUpdate(
    userId,
    { expireAt },
    {
      new: true,
      fields: { _id: 1, userName: 1, expireAt: 1 },
    }
  );
  return userDb;
};

