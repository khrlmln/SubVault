import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { USER_ROLES } from "../constants/role.constants.js";
import { Subscription } from "../models/subscription.model.js";
import AppError from "../utils/appError.js";

const ownerFilter = (currentUser) =>
  currentUser.role === USER_ROLES.ADMIN ? {} : { user: currentUser._id };

const assertValidRenewalWindow = ({ startDate, renewalDate }) => {
  if (startDate && renewalDate && renewalDate <= startDate) {
    throw new AppError(
      '"renewalDate" must be after "startDate"',
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

export const createSubscription = async (currentUser, data) => {
  return Subscription.create({ ...data, user: currentUser._id });
};

export const getUserSubscriptions = async (
  currentUser,
  { status, page, limit, userId },
) => {
  const query = {
    ...ownerFilter(currentUser),
    ...(status && { status }),
    ...(currentUser.role === USER_ROLES.ADMIN && userId && { user: userId }),
  };

  const skip = (page - 1) * limit;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscription.countDocuments(query),
  ]);

  return {
    subscriptions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getSubscriptionById = async (subscriptionId, currentUser) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    ...ownerFilter(currentUser),
  });

  if (!subscription) {
    throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND);
  }

  return subscription;
};

export const updateSubscription = async (
  subscriptionId,
  currentUser,
  updates,
) => {
  const scope = { _id: subscriptionId, ...ownerFilter(currentUser) };

  if (updates.startDate || updates.renewalDate) {
    const current = await Subscription.findOne(scope);

    if (!current) {
      throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND);
    }

    assertValidRenewalWindow({
      startDate: updates.startDate ?? current.startDate,
      renewalDate: updates.renewalDate ?? current.renewalDate,
    });
  }

  const subscription = await Subscription.findOneAndUpdate(scope, updates, {
    new: true,
    runValidators: true,
    context: "query",
  });

  if (!subscription) {
    throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND);
  }

  return subscription;
};

export const deleteSubscription = async (subscriptionId, currentUser) => {
  const subscription = await Subscription.findOneAndDelete({
    _id: subscriptionId,
    ...ownerFilter(currentUser),
  });

  if (!subscription) {
    throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND);
  }

  return subscription;
};

export const cancelSubscription = async (subscriptionId, currentUser) => {
  const scope = { _id: subscriptionId, ...ownerFilter(currentUser) };

  const subscription = await Subscription.findOneAndUpdate(
    { ...scope, status: { $ne: "cancelled" } },
    { status: "cancelled", renewalDate: null },
    { new: true, runValidators: true, context: "query" },
  );

  if (subscription) {
    return subscription;
  }

  const exists = await Subscription.exists(scope);

  if (exists) {
    throw new AppError(
      "Subscription is already cancelled",
      HTTP_STATUS.CONFLICT,
    );
  }

  throw new AppError("Subscription not found", HTTP_STATUS.NOT_FOUND);
};

export const getUpcomingRenewals = async (currentUser, days) => {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(now.getDate() + days);

  return Subscription.find({
    ...ownerFilter(currentUser),
    status: "active",
    renewalDate: { $gte: now, $lte: windowEnd },
  }).sort({ renewalDate: 1 });
};
