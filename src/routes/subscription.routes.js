import { Router } from "express";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscriptionDetails,
  getUpcomingRenewals,
  getUserSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createSubscriptionSchema,
  listSubscriptionsQuerySchema,
  subscriptionIdParamSchema,
  upcomingRenewalsQuerySchema,
  updateSubscriptionSchema,
} from "../validations/subscription.validation.js";

const subscriptionRouter = Router();

subscriptionRouter
  .route("/")
  .get(
    authenticate,
    validate(listSubscriptionsQuerySchema),
    getUserSubscriptions,
  )
  .post(authenticate, validate(createSubscriptionSchema), createSubscription);

subscriptionRouter
  .route("/upcoming-renewals")
  .get(
    authenticate,
    validate(upcomingRenewalsQuerySchema),
    getUpcomingRenewals,
  );

subscriptionRouter
  .route("/:id/cancel")
  .patch(authenticate, validate(subscriptionIdParamSchema), cancelSubscription);

subscriptionRouter
  .route("/:id")
  .get(
    authenticate,
    validate(subscriptionIdParamSchema),
    getSubscriptionDetails,
  )
  .patch(authenticate, validate(updateSubscriptionSchema), updateSubscription)
  .delete(
    authenticate,
    validate(subscriptionIdParamSchema),
    deleteSubscription,
  );

export default subscriptionRouter;
