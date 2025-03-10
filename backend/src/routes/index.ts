import { Router } from "express";
import student from "./student/index";

const router = Router();

router.use("/v1/api/students", student);

export default router;