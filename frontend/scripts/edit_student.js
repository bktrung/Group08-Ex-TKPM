document.addEventListener("DOMContentLoaded", async function () {
    // Lấy studentId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        showErrorModal("Không tìm thấy mã sinh viên");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
        return;
    }

    await fetchStudentData(studentId);
    await fetchDepartmentTypes();
    await fetchStatusTypes();
});

// Lấy thông tin chi tiết của sinh viên
async function fetchStudentData(studentId) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students?page=1&limit=100`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const students = data.metadata.students;
        const student = students.find(s => s.studentId === studentId);

        if (!student) {
            showErrorModal("Không tìm thấy sinh viên");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
            return;
        }

        // Điền thông tin sinh viên vào form
        document.getElementById('student-id').value = student.studentId;
        document.getElementById('student-name').value = student.fullName;
        
        const dob = new Date(student.dateOfBirth);
        const formattedDob = dob.toISOString().split('T')[0];
        document.getElementById('student-dob').value = formattedDob;
        
        document.getElementById('student-gender').value = student.gender;
        document.getElementById('student-course').value = student.schoolYear;
        document.getElementById('student-program').value = student.program;
        document.getElementById('student-address').value = student.address;
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-phone').value = student.phoneNumber;

        window.studentDepartment = student.department;
        window.studentStatus = student.status || "Đang học";

    } catch (error) {
        console.error("Lỗi khi lấy thông tin sinh viên:", error);
        showErrorModal("Không thể lấy thông tin sinh viên: " + error.message);
    }
}

async function fetchDepartmentTypes() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/department-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const departmentList = data.metadata.DepartmentTypes;
        const facultySelect = document.getElementById("student-faculty");

        // Xóa tất cả option cũ
        facultySelect.innerHTML = '';

        // Thêm option mới từ API
        departmentList.forEach(department => {
            const option = document.createElement("option");
            option.value = department;
            option.textContent = department;
            facultySelect.appendChild(option);
        });

        // Chọn khoa hiện tại của sinh viên
        if (window.studentDepartment) {
            facultySelect.value = window.studentDepartment;
        }

    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
        showErrorModal("Không thể lấy danh sách khoa: " + error.message);
    }
}

async function fetchStatusTypes() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const statusList = data.metadata.studentStatusTypes;
        const statusSelect = document.getElementById("student-status");

        // Xóa tất cả option cũ
        statusSelect.innerHTML = '';

        // Thêm option mới từ API
        statusList.forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        // Chọn tình trạng hiện tại của sinh viên
        if (window.studentStatus) {
            statusSelect.value = window.studentStatus;
        }

    } catch (error) {
        console.error("Lỗi khi lấy danh sách tình trạng:", error);
        showErrorModal("Không thể lấy danh sách tình trạng: " + error.message);
    }
}

document.getElementById('edit-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    const fields = ['student-name', 'student-dob', 'student-course', 'student-program', 'student-address', 'student-email', 'student-phone'];
    let isValid = true;

    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input.value.trim() === '') {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });

    // Kiểm tra email và số điện thoại
    const studentIdInput = document.getElementById('student-id');
    const emailInput = document.getElementById('student-email');
    const phoneInput = document.getElementById('student-phone');
    const DOB = document.getElementById('student-dob');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;
    const studentIdPattern = /^\d{8}$/;

    if (!studentIdPattern.test(studentIdInput.value)) {
        studentIdInput.classList.add('is-invalid');
        studentIdInput.classList.remove('is-valid');
        isValid = false;
    }

    const dobValue = new Date(DOB.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (dobValue >= today) {
        DOB.classList.add('is-invalid');
        DOB.classList.remove('is-valid');
        isValid = false;
    }

    const courseInput = document.getElementById('student-course');
    const currentYear = new Date().getFullYear();

    if (parseInt(courseInput.value) > currentYear) {
        courseInput.classList.add('is-invalid');
        courseInput.classList.remove('is-valid');
        isValid = false;
    } else if (courseInput.value.trim() !== '') {
        courseInput.classList.remove('is-invalid');
        courseInput.classList.add('is-valid');
    }

    if (!emailPattern.test(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        isValid = false;
    }

    if (!phonePattern.test(phoneInput.value)) {
        phoneInput.classList.add('is-invalid');
        phoneInput.classList.remove('is-valid');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    try {
        const studentId = document.getElementById('student-id').value;
        
        const student = {
            studentId: studentId,
            fullName: document.getElementById('student-name').value,
            dateOfBirth: document.getElementById('student-dob').value,
            gender: document.getElementById('student-gender').value,
            department: document.getElementById('student-faculty').value,
            schoolYear: document.getElementById('student-course').value,
            program: document.getElementById('student-program').value,
            address: document.getElementById('student-address').value,
            email: emailInput.value,
            phoneNumber: phoneInput.value,
            status: document.getElementById('student-status').value
        };

        const response = await fetch(`http://127.0.0.1:3456/v1/api/students/${studentId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.message && errorData.message.includes("điện thoại đã được sử dụng")) {
                const phoneInput = document.getElementById('student-phone');
                phoneInput.classList.add('is-invalid');
                phoneInput.classList.remove('is-valid');
                return; 
            }
            throw new Error(errorData.message || `Lỗi API: ${response.status}`);
        }

        showSuccessModal();

    } catch (error) {
        console.error("Lỗi khi cập nhật sinh viên:", error);
        showErrorModal(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
});

// Hiển thị modal lỗi
function showErrorModal(message) {
    document.getElementById('errorModalMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// Hiển thị modal thành công
function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    document.getElementById('successModalClose').addEventListener('click', function () {
        window.location.href = "index.html"; // Chuyển trang sau khi đóng modal
    });
}