document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:3456/v1/api";
    let statuses = [];
    let editingStatusId = null;
    const modalInstance = new bootstrap.Modal(document.getElementById("statusModal"));

    async function fetchStatuses() {
        try {
            const response = await fetch(`${API_BASE_URL}/students/status-types`);
            if (!response.ok) throw new Error("Lỗi khi lấy danh sách trạng thái!");
            
            const data = await response.json();
            if (data.status === 200 && Array.isArray(data.metadata)) {
                statuses = data.metadata.map(status => ({
                    id: status._id,
                    type: status.type
                }));
                renderTable();
            } else {
                console.error("Lỗi dữ liệu từ API");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    async function saveStatus() {
        const type = document.getElementById("statusType").value.trim();
        if (!type) {
            alert("Vui lòng nhập tình trạng sinh viên!");
            return;
        }

        try {
            const isEditing = Boolean(editingStatusId);
            const url = isEditing 
                ? `${API_BASE_URL}/students/status-types/${editingStatusId}`
                : `${API_BASE_URL}/students/status-types`;
            
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Có lỗi xảy ra khi lưu tình trạng sinh viên!");
                return;
            }

            modalInstance.hide();
            fetchStatuses();
        } catch (error) {
            alert("Lỗi kết nối đến máy chủ!");
        }
    }

    function renderTable() {
        const tbody = document.getElementById("status-table-body");
        if (!tbody) return;
        
        tbody.innerHTML = statuses.map((status, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${status.type}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="editStatus('${status.id}')">Sửa</button>
                </td>
            </tr>
        `).join("");
    }

    function addStatus() {
        resetModalForm("Thêm Tình trạng");
        modalInstance.show();
    }

    function editStatus(id) {
        const status = statuses.find(s => s.id === id);
        if (!status) return;
        
        resetModalForm("Chỉnh sửa Tình trạng", status.type);
        editingStatusId = id;
        modalInstance.show();
    }
    
    function resetModalForm(title, value = "") {
        document.getElementById("modalTitle").innerText = title;
        document.getElementById("statusType").value = value;
        if (!value) editingStatusId = null;
    }

    function initEventListeners() {
        document.getElementById("saveStatusBtn").addEventListener("click", saveStatus);
        document.getElementById("addStatusBtn").addEventListener("click", addStatus);
    }

    window.editStatus = editStatus;

    initEventListeners();
    fetchStatuses();
});