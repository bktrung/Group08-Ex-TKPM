document.addEventListener("DOMContentLoaded", function () {
    let statuses = [];
    let editingStatusId = null;
    const modalInstance = new bootstrap.Modal(document.getElementById("statusModal"));

    async function fetchStatuses() {
        try {
            const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
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
            let url = "http://127.0.0.1:3456/v1/api/students/status-types";
            let method = "POST";
            let bodyData = { type };

            if (editingStatusId) {
                url = `http://127.0.0.1:3456/v1/api/students/status-types/${editingStatusId}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
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
        document.getElementById("modalTitle").innerText = "Thêm Tình trạng";
        document.getElementById("statusType").value = "";
        editingStatusId = null;
        modalInstance.show();
    }

    window.editStatus = function (id) {
        const status = statuses.find(s => s.id === id);
        if (status) {
            document.getElementById("modalTitle").innerText = "Chỉnh sửa Tình trạng";
            document.getElementById("statusType").value = status.type;
            editingStatusId = id;
            modalInstance.show();
        }
    };

    document.getElementById("saveStatusBtn").addEventListener("click", saveStatus);
    document.getElementById("addStatusBtn").addEventListener("click", addStatus);

    fetchStatuses();
});
