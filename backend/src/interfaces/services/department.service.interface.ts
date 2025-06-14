import { IDepartment } from "../../models/interfaces/department.interface";

export interface IDepartmentService {
	addDepartment(departmentName: string): Promise<IDepartment>;
	updateDepartment(departmentId: string, departmentName: string): Promise<IDepartment>;
	getDepartments(): Promise<IDepartment[]>;
	deleteDepartment(departmentId: string): Promise<IDepartment>;
} 