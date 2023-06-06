import express from "express";
import { userRouter } from "./route.js";
import { isClientAllowedToRequest } from "./utils/server-utils.js";
const defaultErrorMessage = "Something went wrong!";

export default class Server {
  app = express();
  constructor() {
    this.requestValidator();
    this.getRoutes();
    this.error404NotFound();
    this.errorHandler();
  }

  requestValidator = () => {
    this.app.use(isClientAllowedToRequest);
  };

  getRoutes = () => {
    this.app.use("/api", userRouter);
  };

  error404NotFound = () => {
    this.app.use((req, res) => {
      req.errorCode = 404;
      throw new Error("Not found");
    });
  };

  errorHandler = () => {
    this.app.use((error, req, res, next) => {
      const errorCode = req.errorCode || 500;
      const message = error.message || defaultErrorMessage;
      res.status(errorCode).json({ message, errorCode });
    });
  };
}
