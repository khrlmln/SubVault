import mongoose from "mongoose";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/role.constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "user name is required"],
      trim: true,
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: [true, "user email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "user password is required"],
      minLength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;

        return ret;
      },
    },
  },
);

export const User = mongoose.model("User", userSchema);
