import { Router } from 'express';
import EnrollmentController from '../../controllers/enrollment.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.post('', asyncHandler(EnrollmentController.enrollStudent));

export default router;