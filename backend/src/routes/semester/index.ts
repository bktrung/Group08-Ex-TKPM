import { Router } from 'express';
import semesterController from '../../controllers/semester.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.post('', asyncHandler(semesterController.createSemester));

export default router;