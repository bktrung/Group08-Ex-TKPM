import { Router } from "express";
import student from "./student";
import department from "./department";
import program from "./program";
import address from "./address";
import exportData from "./export";
import importData from "./import";
import course from "./course";
import classes from "./class";
import enrollment from "./enrollment";
import semester from "./semester";
import grade from "./grade";
import transcript from "./transcript";

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
router.use("/v1/api/semesters", semester);
router.use("/v1/api/grades", grade);
router.use("/v1/api/transcript", transcript);


export default router;