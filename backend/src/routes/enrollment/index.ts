import { Router } from 'express';
import EnrollmentController from '../../controllers/enrollment.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.post('', asyncHandler(EnrollmentController.enrollStudent));
router.post('/drop', asyncHandler(EnrollmentController.dropStudent));
router.get('/drop-history/:studentId', asyncHandler(EnrollmentController.getDropHistory));

export default router;