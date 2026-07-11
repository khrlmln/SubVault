import mongoose from "mongoose";
import {
  DEFAULT_CURRENCY,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_CURRENCIES,
  SUBSCRIPTION_FREQUENCIES,
  SUBSCRIPTION_STATUSES,
} from "../constants/subscription.constants.js";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "subscription name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "subscription price is required"],
      min: [0, "price cannot be negative"],
    },
    currency: {
      type: String,
      enum: SUBSCRIPTION_CURRENCIES,
      default: DEFAULT_CURRENCY,
    },
    frequency: {
      type: String,
      enum: SUBSCRIPTION_FREQUENCIES,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: SUBSCRIPTION_CATEGORIES,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!(this instanceof mongoose.Document)) return true;
          return !value || value > this.startDate;
        },
        message: "renewal date must be after the start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;

        return ret;
      },
    },
  },
);

// auto calculate renewal date if missing
subscriptionSchema.pre("save", function () {
  if (!this.renewalDate) {
    const renewalDate = new Date(this.startDate);

    switch (this.frequency) {
      case "weekly":
        renewalDate.setDate(renewalDate.getDate() + 7);
        break;
      case "monthly":
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        break;
      case "yearly":
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        break;
    }

    this.renewalDate = renewalDate;
  }

  // auto update the status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
