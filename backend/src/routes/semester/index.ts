import { Router } from 'express';
import semesterController from '../../controllers/semester.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
import { createSemesterValidator } from '../../validators/semester/create-semester.validator';
const router = Router();

router.post('', createSemesterValidator, asyncHandler(semesterController.createSemester));

export default router;