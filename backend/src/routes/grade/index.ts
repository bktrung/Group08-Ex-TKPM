import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { GradeController } from '../../controllers/grade.controller';

const router = Router();

// Lazy resolution of controller
const getGradeController = () => container.get<GradeController>(TYPES.GradeController);

// Create grade
router.post("", asyncHandler((req, res, next) => 
	getGradeController().createGrade(req, res, next)
));

// Get all grades for a specific class
router.get("/class/:classCode", asyncHandler((req, res, next) => 
	getGradeController().getGradesByClass(req, res, next)
));

// Get grade for a specific student in a specific class
router.get("/student/:studentId/class/:classCode", asyncHandler((req, res, next) => 
	getGradeController().getGradeByStudentAndClass(req, res, next)
));

// Update grade by ID
router.patch("/:id", asyncHandler((req, res, next) => 
	getGradeController().updateGrade(req, res, next)
));

// Delete grade by ID
router.delete("/:id", asyncHandler((req, res, next) => 
	getGradeController().deleteGrade(req, res, next)
));

export default router;