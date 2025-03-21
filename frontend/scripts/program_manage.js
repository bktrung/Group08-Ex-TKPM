document.addEventListener("DOMContentLoaded", function () {
    let programs = [];
    let editingProgramId = null;

    async function fetchPrograms() {
        try {
            const response = await fetch("http://127.0.0.1:3456/v1/api/programs");
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
            let url = "http://127.0.0.1:3456/v1/api/programs";
            let method = "POST";
            let bodyData = { name };
    
            if (editingProgramId) {
                url = `http://127.0.0.1:3456/v1/api/programs/${editingProgramId}`;
                method = "PATCH";
            }
    
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
    
            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Có lỗi xảy ra khi lưu chương trình đào tạo!");
                return;
            }
    
            bootstrap.Modal.getInstance(document.getElementById("programModal")).hide();
            fetchPrograms();
        } catch (error) {
            alert("Lỗi kết nối đến máy chủ!");
        }
    }
    

    function renderTable() {
        const tbody = document.getElementById("program-table-body");
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

    window.openModal = function () {
        document.getElementById("modalTitle").innerText = "Thêm Chương trình đào tạo";
        document.getElementById("programName").value = "";
        editingProgramId = null;
    };

    window.editProgram = function (id) {
        const program = programs.find(p => p.id === id);
        if (program) {
            document.getElementById("modalTitle").innerText = "Chỉnh sửa Chương trình đào tạo";
            document.getElementById("programName").value = program.name;
            editingProgramId = id;
            new bootstrap.Modal(document.getElementById("programModal")).show();
        }
    };

    document.getElementById("saveProgramBtn").addEventListener("click", saveProgram);

    fetchPrograms();
});
