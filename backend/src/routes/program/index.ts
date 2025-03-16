import { Router } from 'express';
import ProgramController from '../../controllers/program.controller';
import { asyncHandler } from "../../helpers/asyncHandler";
const router = Router();

router.post('', asyncHandler(ProgramController.addProgram));
router.get('', asyncHandler(ProgramController.getPrograms));
router.patch('/:id', asyncHandler(ProgramController.updateProgram));

export default router;