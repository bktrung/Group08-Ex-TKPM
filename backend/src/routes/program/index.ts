import { Router } from 'express';
import { asyncHandler } from "../../helpers/asyncHandler";
import { container } from '../../configs/di.config';
import { TYPES } from '../../configs/di.types';
import { ProgramController } from '../../controllers/program.controller';

const router = Router();

// Lazy resolution of controller
const getProgramController = () => container.get<ProgramController>(TYPES.ProgramController);

router.post('', asyncHandler((req, res, next) => 
	getProgramController().addProgram(req, res, next)
));
router.get('', asyncHandler((req, res, next) => 
	getProgramController().getPrograms(req, res, next)
));
router.patch('/:id', asyncHandler((req, res, next) => 
	getProgramController().updateProgram(req, res, next)
));

export default router;