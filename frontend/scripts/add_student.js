document.addEventListener("DOMContentLoaded", async function () {
    const facultySelect = document.getElementById("student-faculty");

    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/department-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const departmentList = data.metadata.DepartmentTypes; // Lấy danh sách khoa từ API

        // Xóa tất cả option cũ
        facultySelect.innerHTML = '<option value="">Chọn Khoa</option>';

        // Thêm option mới từ API
        departmentList.forEach(department => {
            const option = document.createElement("option");
            option.value = department;
            option.textContent = department;
            facultySelect.appendChild(option);
        });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
    }
});


document.addEventListener("DOMContentLoaded", async function () {
    const statusSelect = document.getElementById("student-status");

    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const statusList = data.metadata.studentStatusTypes; // Lấy danh sách khoa từ API

        // Xóa tất cả option cũ
        statusSelect.innerHTML = '<option value="">Chọn tình trạng</option>';

        // Thêm option mới từ API
        statusList.forEach(department => {
            const option = document.createElement("option");
            option.value = department;
            option.textContent = department;
            statusSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách tình trạng:", error);
    }
});


document.getElementById('add-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fields = ['student-id', 'student-name', 'student-dob', 'student-course', 'student-program', 'student-address', 'student-email', 'student-phone'];
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

    // Nếu dữ liệu hợp lệ, gửi lên API
    try {
        const student = {
            studentId: studentIdInput.value,
            fullName: document.getElementById('student-name').value,
            dateOfBirth: document.getElementById('student-dob').value,
            gender: document.getElementById('student-gender').value,
            department: document.getElementById('student-faculty').value,
            schoolYear: document.getElementById('student-course').value,
            program: document.getElementById('student-program').value,
            address: document.getElementById('student-address').value,
            email: emailInput.value,
            phoneNumber: phoneInput.value
        };

        const response = await fetch("http://127.0.0.1:3456/v1/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Lỗi API: ${response.status}`);
        }

        showSuccessModal();

    } catch (error) {
        console.error("Lỗi khi thêm sinh viên:", error);
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