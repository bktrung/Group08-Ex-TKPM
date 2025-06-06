import stundentApi from './student.js';
import courseApi from './course.js';
import departmentApi from './department.js';
import programApi from './program.js';
import statusTypeApi from './status.type.js';
import statusTransitionApi from './status.transition.js';
import classApi from './class.js';
import enrollmentApi from './enrollment.js';
import geographyApi from './geography.js';

export default {
    student: stundentApi,
    course: courseApi,
    department: departmentApi,
    program: programApi,
    statusType: statusTypeApi,
    statusTransition: statusTransitionApi,
    class: classApi,
    enrollment: enrollmentApi,
    geography: geographyApi
};
// Note: The above import paths assume that the files are located in the same directory as this index.js file.