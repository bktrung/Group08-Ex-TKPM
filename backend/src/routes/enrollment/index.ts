import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { EnrollmentController } from '../../controllers/enrollment.controller';

const router = Router();

// Lazy resolution of controller
const getEnrollmentController = () => container.get<EnrollmentController>(TYPES.EnrollmentController);

router.post('', asyncHandler((req, res, next) => 
	getEnrollmentController().enrollStudent(req, res, next)
));
router.post('/drop', asyncHandler((req, res, next) => 
	getEnrollmentController().dropStudent(req, res, next)
));
router.get('/drop-history/:studentId', asyncHandler((req, res, next) => 
	getEnrollmentController().getDropHistory(req, res, next)
));

export default router;