import express from "express"
import { allTags } from "./tags.controller.js";

const tagsRoute = express.Router();

tagsRoute.get("/",allTags)

export default tagsRoute