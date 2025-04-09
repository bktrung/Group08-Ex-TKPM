import Class from "../class.model";
import { CreateClassDto } from "../../dto/class";
import { IClass, ISchedule } from "../interfaces/class.interface";

export const findClassByCode = async (classCode: string) => {
	return await Class.findOne({ classCode }).lean();
}

export const createClass = async (classData: CreateClassDto) => {
	return await Class.create(classData);
}

/**
 * Find classes that might have schedule conflicts with the given schedule
 * @param schedules Array of schedule items to check for conflicts
 * @param excludeClassCode Optional class code to exclude from the search (for updates)
 * @returns Array of classes with potential scheduling conflicts
 */
export const findClassesWithOverlappingSchedule = async (
	schedules: ISchedule[],
	excludeClassCode?: string
): Promise<IClass[]> => {
	// First, collect all the days of week from the schedules
	const daysOfWeek = [...new Set(schedules.map(s => s.dayOfWeek))];

	// Collect all classrooms used in the schedules
	const classrooms = [...new Set(schedules.map(s => s.classroom))];

	// Build query to find potential conflicts
	const query: any = {
		// Only consider active classes
		isActive: true,

		// Find classes that have schedules on the same days
		'schedule.dayOfWeek': { $in: daysOfWeek },

		// Find classes that use the same classrooms
		'schedule.classroom': { $in: classrooms }
	};

	// Exclude the current class if updating
	if (excludeClassCode) {
		query.classCode = { $ne: excludeClassCode };
	}

	// Find potentially conflicting classes
	const potentialConflicts = await Class.find(query).lean();

	// Filter classes that actually have time conflicts
	// (We need to do this in code since MongoDB can't check this complex condition)
	return potentialConflicts.filter(cls => {
		// For each potential conflict class
		for (const existingSchedule of cls.schedule) {
			// Check against each of our new schedules
			for (const newSchedule of schedules) {
				// Only check conflicts if same day and same classroom
				if (existingSchedule.dayOfWeek === newSchedule.dayOfWeek &&
					existingSchedule.classroom === newSchedule.classroom) {

					// Check for time period overlap
					const overlap = (
						// Case 1: New schedule starts during existing schedule
						(newSchedule.startPeriod <= existingSchedule.endPeriod &&
							newSchedule.startPeriod >= existingSchedule.startPeriod) ||

						// Case 2: New schedule ends during existing schedule
						(newSchedule.endPeriod >= existingSchedule.startPeriod &&
							newSchedule.endPeriod <= existingSchedule.endPeriod) ||

						// Case 3: New schedule completely surrounds existing schedule
						(newSchedule.startPeriod <= existingSchedule.startPeriod &&
							newSchedule.endPeriod >= existingSchedule.endPeriod)
					);

					if (overlap) {
						return true; // There's a conflict, include this class
					}
				}
			}
		}
		return false; // No conflicts found
	});
};