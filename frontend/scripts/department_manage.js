document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:3456";
    let faculties = [];
    let editingFacultyId = null;
    let modalInstance = new bootstrap.Modal(document.getElementById("facultyModal"));

    async function fetchFaculties() {
        try {
            const response = await fetch(`${API_BASE_URL}/v1/api/departments`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách khoa!");

            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.metadata.departments)) {
                faculties = data.metadata.departments.map(dept => ({
                    id: dept._id,
                    name: dept.name
                }));
                renderTable();
            } else {
                console.error("Dữ liệu API không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    async function saveFaculty() {
        const name = document.getElementById("facultyName").value.trim();
        if (!name) {
            alert("Vui lòng nhập tên khoa!");
            return;
        }

        try {
            let url = `${API_BASE_URL}/v1/api/departments`;
            let method = "POST";
            let bodyData = { name };

            if (editingFacultyId) {
                url = `${API_BASE_URL}/v1/api/departments/${editingFacultyId}`;
                method = "PATCH";
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Có lỗi xảy ra khi lưu khoa!");
                return;
            }

            closeModal();
            fetchFaculties();
        } catch (error) {
            alert("Lỗi kết nối đến máy chủ!");
        }
    }

    function renderTable() {
        const tbody = document.getElementById("faculty-table-body");
        if (!tbody) return;

        tbody.innerHTML = faculties.map((faculty, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${faculty.name}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="editFaculty('${faculty.id}')">Sửa</button>
                </td>
            </tr>
        `).join("");
    }

    function addFaculty() {
        resetModalForm("Thêm Khoa");
        modalInstance.show();
    }

    function editFaculty(id) {
        const faculty = faculties.find(f => f.id === id);
        if (!faculty) return;
        
        resetModalForm("Chỉnh sửa Khoa", faculty.name);
        editingFacultyId = id;
        modalInstance.show();
    }

    function resetModalForm(title, value = "") {
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("facultyName").value = value;
        if (!value) editingFacultyId = null;
    }

    function closeModal() {
        modalInstance.hide();
    }

    function initEventListeners() {
        document.getElementById("saveFacultyBtn").addEventListener("click", saveFaculty);
        document.getElementById("addFacultyBtn").addEventListener("click", addFaculty);
    }

    window.addFaculty = addFaculty;
    window.editFaculty = editFaculty;

    initEventListeners();
    fetchFaculties();
});