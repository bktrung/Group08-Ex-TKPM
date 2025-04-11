import GradeController from "../../controllers/grade.controller";
import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.post("", asyncHandler(GradeController.createGrade));

export default router;