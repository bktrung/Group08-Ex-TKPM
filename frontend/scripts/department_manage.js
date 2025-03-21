
document.addEventListener("DOMContentLoaded", function () {
    let faculties = [];
    let editingFacultyId = null;
    let modalInstance = new bootstrap.Modal(document.getElementById("facultyModal")); // ✅ Tạo modal một lần

    async function fetchFaculties() {
        try {
            const response = await fetch("http://127.0.0.1:3456/v1/api/departments");
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
            let url = "http://127.0.0.1:3456/v1/api/departments";
            let method = "POST";
            let bodyData = { name };

            if (editingFacultyId) {
                url = `http://127.0.0.1:3456/v1/api/departments/${editingFacultyId}`;
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

            closeModal(); // ✅ Đóng modal sau khi lưu thành công
            fetchFaculties(); // ✅ Cập nhật danh sách khoa
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
        document.getElementById("modalTitle").innerText = "Thêm Khoa";
        document.getElementById("facultyName").value = ""; // ✅ Đặt lại giá trị
        editingFacultyId = null; // ✅ Đảm bảo không ở chế độ chỉnh sửa

        modalInstance.show(); // ✅ Mở modal
    }

    function editFaculty(id) {
        const faculty = faculties.find(f => f.id === id);
        if (faculty) {
            document.getElementById("modalTitle").innerText = "Chỉnh sửa Khoa";
            document.getElementById("facultyName").value = faculty.name;
            editingFacultyId = id;

            modalInstance.show();
        }
    }

    function closeModal() {
        modalInstance.hide(); // ✅ Chỉ đóng modal, không dispose
    }

    document.getElementById("saveFacultyBtn").addEventListener("click", saveFaculty);
    document.getElementById("addFacultyBtn").addEventListener("click", addFaculty);

    window.addFaculty = addFaculty; // ✅ Gán hàm vào window để gọi từ HTML
    window.editFaculty = editFaculty;

    fetchFaculties();
});
