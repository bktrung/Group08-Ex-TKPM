import { Router } from "express";
import student from "./student/index";
import department from "./department/index";
import program from "./program/index";
import address from "./address/index";
import exportData from "./export/index";
import importData from "./import/index";
import course from "./course/index";
import classes from "./class/index";
import enrollment from "./enrollment/index";

const router = Router();

router.use("/v1/api/students", student);
router.use("/v1/api/departments", department);
router.use("/v1/api/programs", program);
router.use("/v1/api/address", address);
router.use("/v1/api/export", exportData);
router.use("/v1/api/import", importData);
router.use("/v1/api/courses", course);
router.use("/v1/api/classes", classes);
router.use("/v1/api/enrollment", enrollment);

export default router;