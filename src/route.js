import { Router } from "express";

export const userRouter = new Router();

userRouter.get("/health", (req, res) => {
  res.send("ok");
});


