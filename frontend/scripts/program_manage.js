document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:3456/v1/api";
    let programs = [];
    let editingProgramId = null;
    const modalInstance = new bootstrap.Modal(document.getElementById("programModal"));

    async function fetchPrograms() {
        try {
            const response = await fetch(`${API_BASE_URL}/programs`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách chương trình!");
            
            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.metadata.programs)) {
                programs = data.metadata.programs.map(prog => ({
                    id: prog._id,
                    name: prog.name
                }));
                renderTable();
            } else {
                console.error("Lỗi dữ liệu từ API");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    async function saveProgram() {
        const name = document.getElementById("programName").value.trim();
        if (!name) {
            alert("Vui lòng nhập tên chương trình đào tạo!");
            return;
        }

        try {
            const isEditing = Boolean(editingProgramId);
            const url = isEditing 
                ? `${API_BASE_URL}/programs/${editingProgramId}`
                : `${API_BASE_URL}/programs`;
            
            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Có lỗi xảy ra khi lưu chương trình đào tạo!");
                return;
            }

            modalInstance.hide();
            fetchPrograms();
        } catch (error) {
            alert("Lỗi kết nối đến máy chủ!");
        }
    }

    function renderTable() {
        const tbody = document.getElementById("program-table-body");
        if (!tbody) return;
        
        tbody.innerHTML = programs.map((program, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${program.name}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="editProgram('${program.id}')">Sửa</button>
                </td>
            </tr>
        `).join("");
    }

    function addProgram() {
        resetModalForm("Thêm Chương trình đào tạo");
        modalInstance.show();
    }

    function editProgram(id) {
        const program = programs.find(p => p.id === id);
        if (!program) return;
        
        resetModalForm("Chỉnh sửa Chương trình đào tạo", program.name);
        editingProgramId = id;
        modalInstance.show();
    }
    
    function resetModalForm(title, value = "") {
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("programName").value = value;
        if (!value) editingProgramId = null;
    }

    function initEventListeners() {
        document.getElementById("saveProgramBtn").addEventListener("click", saveProgram);
        document.getElementById("addProgramBtn").addEventListener("click", addProgram);
    }

    window.editProgram = editProgram;

    initEventListeners();
    fetchPrograms();
});