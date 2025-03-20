document.addEventListener("DOMContentLoaded", function () {
    let faculties = [];
    let editingFacultyId = null;

    async function fetchFaculties() {
        try {
            const response = await fetch("http://127.0.0.1:3456/v1/api/departments");
            const data = await response.json();

            if (data.status === 200 && Array.isArray(data.metadata.departments)) {
                faculties = data.metadata.departments.map(dept => ({
                    id: dept._id,
                    name: dept.name
                }));
                renderTable();
            } else {
                console.error("Lỗi dữ liệu từ API");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    async function saveFaculty() {
        const name = document.getElementById("facultyName").value.trim();
        if (!name) {
            showError("Vui lòng nhập tên khoa!");
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
                alert(data.message || "Có lỗi xảy ra khi thêm khoa!");
                return;
            }
    
        
            bootstrap.Modal.getInstance(document.getElementById("facultyModal")).hide();
            fetchFaculties();
        } catch (error) {
            showError("Lỗi kết nối đến máy chủ!");
        }
    }
    

    function renderTable() {
        const tbody = document.getElementById("faculty-table-body");
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



    window.openModal = function () {
        document.getElementById("modalTitle").innerText = "Thêm Khoa";
        document.getElementById("facultyName").value = "";
        document.getElementById("facultyId").value = "";
    
        editingFacultyId = null;
    };

    window.editFaculty = function (id) {
        const faculty = faculties.find(f => f.id === id);
        if (faculty) {
            document.getElementById("modalTitle").innerText = "Chỉnh sửa Khoa";
            document.getElementById("facultyName").value = faculty.name;
            editingFacultyId = id;
            new bootstrap.Modal(document.getElementById("facultyModal")).show();
        }
    };

    document.getElementById("saveFacultyBtn").addEventListener("click", saveFaculty);

    fetchFaculties();
});