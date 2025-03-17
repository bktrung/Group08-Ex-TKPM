import { Router } from "express";
import student from "./student/index";
import department from "./department/index";
import program from "./program/index";
import address from "./address/index";

const router = Router();

router.use("/v1/api/students", student);
router.use("/v1/api/departments", department);
router.use("/v1/api/programs", program);
router.use("/v1/api/address", address);

export default router;