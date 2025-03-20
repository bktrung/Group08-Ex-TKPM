import { Router } from "express";
import { asyncHandler } from "../../helpers/asyncHandler";
import ImportController from "../../controllers/import.controller";
import { fileUploadMiddleware } from "../../middlewares/upload.middleware";
const router = Router();

router.post("/students", fileUploadMiddleware, asyncHandler(ImportController.importData));

export default router;