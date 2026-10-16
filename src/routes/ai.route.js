import express from "express";
import { RunAiAgent } from "../services/ai.service.js";

const Router = express.Router();

Router.post("/", RunAiAgent);

export default Router;
