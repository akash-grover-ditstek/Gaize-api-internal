import StatusCodes from './StatusCodes.js';

const _errorLog = function (err) {
  if (process.env.DEBUG) console.error(err);
};

export const badRequestError = function (err, response) {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  _errorLog(err);

  if (response === void 0) response = {};
  response.status = StatusCodes.BAD_REQUEST;
  response.error = err || new Error('Bad request');

  return response;
};

export const forbiddenError = function (err, response) {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  _errorLog(err);

  if (response === void 0) response = {};
  response.status = StatusCodes.FORBIDDEN;
  response.error = err || new Error('Forbidden');

  return response;
};

export const internalServerError = function (err, response) {
  _errorLog(err);

  if (response === void 0) response = {};
  response.status = StatusCodes.INTERNAL_SERVER_ERROR;
  response.error = err;

  return response;
};

export const notFoundError = function (err, response) {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  _errorLog(err);

  if (response === void 0) response = {};
  response.status = StatusCodes.NOT_FOUND;
  response.error = err || new Error('Not found');

  return response;
};

export const pageExpiredError = function (err, response) {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  _errorLog(err);

  if (response === void 0) response = {};
  response.status = StatusCodes.PAGE_EXPIRED;
  response.error = err || new Error('Page expired');

  return response;
};

export const validationError = function (res, err, response) {

  if (response === void 0) response = {};
  response.status = StatusCodes.BAD_REQUEST;
  // response.error = err.details[0].message;
  response.errors = err.details;
  res.status(response.status).json(response)
};

export const ErrorMessage  = {
  BAD_GATEWAY : "Bad Gateway",
  BAD_REQUEST : "Bad Request",
  CREATED : "Created",
  FORBIDDEN : "Forbidden",
  GATEWAY_TIMEOUT : "Gateway Timeout",
  INTERNAL_SERVER_ERROR : "Internal Server Error",
  METHOD_NOT_ALLOWED : "Method Not Allowed",
  MOVED_PERMANENTLY : "Moved Permanently",
  MOVED_TEMPORARILY : "Moved Temporarily",
  NO_CONTENT : "No Content",
  NOT_FOUND : "Not Found",
  OK : "OK",
  UNAUTHORIZED : "Unauthorized",
  UNSUPPORTED_MEDIA_TYPE : "Unsupported Media Type",
}