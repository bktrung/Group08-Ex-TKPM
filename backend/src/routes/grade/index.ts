import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { GradeController } from '../../controllers/grade.controller';

const router = Router();

// Lazy resolution of controller
const getGradeController = () => container.get<GradeController>(TYPES.GradeController);

router.post("", asyncHandler((req, res, next) => 
	getGradeController().createGrade(req, res, next)
));

export default router;