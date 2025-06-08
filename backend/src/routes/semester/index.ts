import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { createSemesterValidator } from '../../validators/semester/create-semester.validator';
import { updateSemesterValidator } from '../../validators/semester/update-semester.validator';
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { SemesterController } from '../../controllers/semester.controller';

const router = Router();

// Lazy resolution of controller
const getSemesterController = () => container.get<SemesterController>(TYPES.SemesterController);

router.post('', createSemesterValidator, asyncHandler((req, res, next) => 
	getSemesterController().createSemester(req, res, next)
));

router.patch('/:id', updateSemesterValidator, asyncHandler((req, res, next) => 
	getSemesterController().updateSemester(req, res, next)
));

export default router;