import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import ExportController from "../../controllers/export.controller";
const router = Router();

router.get("/students", asyncHandler(ExportController.exportData));

export default router;