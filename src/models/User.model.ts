import { Schema, model, Document, models } from "mongoose";

export interface IUser extends Document {
  userName: string;
  password: string;
  expireAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
