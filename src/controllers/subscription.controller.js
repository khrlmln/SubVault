import { HTTP_STATUS } from "../constants/http-status.constants.js";
import * as subscriptionService from "../services/subscription.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(
    req.user,
    req.body,
  );

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: "Subscription created successfully",
    data: subscription,
  });
});

export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const { status, page, limit, userId } = req.query;
  const { subscriptions, meta } =
    await subscriptionService.getUserSubscriptions(req.user, {
      status,
      page,
      limit,
      userId,
    });

  sendSuccess(res, {
    message: "Subscriptions fetched successfully",
    data: subscriptions,
    meta,
  });
});

export const getSubscriptionDetails = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(
    req.params.id,
    req.user,
  );

  sendSuccess(res, {
    message: "Subscription fetched successfully",
    data: subscription,
  });
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.updateSubscription(
    req.params.id,
    req.user,
    req.body,
  );

  sendSuccess(res, {
    message: "Subscription updated successfully",
    data: subscription,
  });
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  await subscriptionService.deleteSubscription(req.params.id, req.user);

  sendSuccess(res, { message: "Subscription deleted successfully" });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(
    req.params.id,
    req.user,
  );

  sendSuccess(res, {
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});

export const getUpcomingRenewals = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const subscriptions = await subscriptionService.getUpcomingRenewals(
    req.user,
    days,
  );

  sendSuccess(res, {
    message: "Upcoming renewals fetched successfully",
    data: subscriptions,
  });
});
