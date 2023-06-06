import * as R from "ramda";

export const clientRequestCountCache = {};

const ERROR_CODES = {
  TOO_MANY_REQUESTS: 429,
};

const CLIENT_REQUEST_TIME_WINDOW = Number(
  process.env.CLIENT_REQUEST_TIME_WINDOW
);

export const getCurrentTime = () => new Date().getTime();

const getTimeDifferenceInSeconds = (timeDetails) => {
  const { currentTime, startTime } = timeDetails;
  return R.subtract(currentTime, startTime) / 1000;
};

const setRequestCountDetailsForCleint = (ip) => {
  const startTime = getCurrentTime();
  const count = 1;
  clientRequestCountCache[ip] = { startTime, count };
};

const isClientIpPresentInCache = (cleintIp) =>
  R.has(cleintIp, clientRequestCountCache);

export const isClientAllowedToRequest = (req, res, next) => {
  const ip = req.ip;
  if (!isClientIpPresentInCache(ip)) {
    setRequestCountDetailsForCleint(ip);
  } else {
    const { canResetClientRequestCount, allowedToRequest } =
      getRequestsStatusOfClient(clientRequestCountCache[ip]);
    clientRequestCountCache[ip].count += 1;
    if (canResetClientRequestCount) {
      delete clientRequestCountCache[ip];
      setRequestCountDetailsForCleint(ip);
    } else if (!allowedToRequest) {
      req.errorCode = ERROR_CODES.TOO_MANY_REQUESTS;
      throw new Error("Too many request in given time window.");
    }
  }
  next();
};

export const getRequestsStatusOfClient = (ipDetails) => {
  let { startTime, count } = ipDetails;
  const currentTime = getCurrentTime();
  const timeDetails = { currentTime, startTime };
  const timeDifference = getTimeDifferenceInSeconds(timeDetails);
  let canResetClientRequestCount = timeDifference > CLIENT_REQUEST_TIME_WINDOW;
  if (canResetClientRequestCount) {
    return { canResetClientRequestCount, allowedToRequest: true };
  }
  canResetClientRequestCount = false;
  if (count <= 5) {
    return { canResetClientRequestCount, allowedToRequest: true };
  }
  return { canResetClientRequestCount, allowedToRequest: false };
};
