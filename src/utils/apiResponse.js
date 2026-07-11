export const sendSuccess = (
  res,
  { statusCode = 200, message = "Success", data, meta } = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  });
};
