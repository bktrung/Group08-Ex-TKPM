document.addEventListener("DOMContentLoaded", async function () {
    await Promise.all([
        fetchStatusTypes(),
        fetchStatusTransitions()
    ]);

    setupFormSubmitHandler();
});

let statusTypes = [];
let statusTransitions = [];

async function fetchStatusTypes() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        statusTypes = data.metadata || [];

        populateStatusDropdowns();
    } catch (error) {
        console.error("Lỗi khi lấy danh sách trạng thái:", error);
        showErrorModal("Không thể lấy danh sách trạng thái: " + error.message);
    }
}

async function fetchStatusTransitions() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-transitions");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        statusTransitions = data.metadata || [];

        renderStatusTransitions();
        renderStatusDiagram();
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quy tắc chuyển đổi:", error);
        showErrorModal("Không thể lấy danh sách quy tắc chuyển đổi: " + error.message);
    }
}

function populateStatusDropdowns() {
    const fromStatusSelect = document.getElementById("from-status");
    const toStatusSelect = document.getElementById("to-status");

    fromStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';
    toStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';

    statusTypes.forEach(status => {
        const fromOption = document.createElement("option");
        fromOption.value = status._id;
        fromOption.textContent = status.type;
        fromStatusSelect.appendChild(fromOption);

        const toOption = document.createElement("option");
        toOption.value = status._id;
        toOption.textContent = status.type;
        toStatusSelect.appendChild(toOption);
    });
}

function renderStatusTransitions() {
    const rulesContainer = document.getElementById("rules-container");
    const noRulesMessage = document.getElementById("no-rules-message");

    rulesContainer.innerHTML = '';

    if (statusTransitions.length === 0) {
        noRulesMessage.style.display = "block";
        rulesContainer.appendChild(noRulesMessage);
        return;
    }

    noRulesMessage.style.display = "none";

    const groupedRules = {};
    statusTransitions.forEach(rule => {
        if (!groupedRules[rule.fromStatus]) {
            groupedRules[rule.fromStatus] = [];
        }
        groupedRules[rule.fromStatus].push(...rule.toStatus);
    });

    Object.keys(groupedRules).forEach(fromStatus => {
        const card = document.createElement("div");
        card.className = "card rule-card";

        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header";
        cardHeader.textContent = `Từ trạng thái: ${fromStatus}`;

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const toStatusList = document.createElement("ul");
        toStatusList.className = "list-group list-group-flush";

        groupedRules[fromStatus].forEach(toStatus => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            
            const arrow = document.createElement("span");
            arrow.className = "badge bg-primary rounded-pill";
            arrow.innerHTML = "&#8594;";
            
            const toStatusText = document.createElement("span");
            toStatusText.textContent = toStatus;
            
            listItem.appendChild(arrow);
            listItem.appendChild(toStatusText);
            
            toStatusList.appendChild(listItem);
        });

        cardBody.appendChild(toStatusList);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        rulesContainer.appendChild(card);
    });
}

function renderStatusDiagram() {
    const diagramContainer = document.getElementById("status-diagram");
    const noDiagramMessage = document.getElementById("no-diagram-message");

    if (statusTransitions.length === 0) {
        noDiagramMessage.textContent = "Chưa có quy tắc nào được thiết lập";
        return;
    }

    noDiagramMessage.style.display = "none";

    const diagram = document.createElement("div");
    diagram.className = "status-flow";

    const table = document.createElement("table");
    table.className = "table table-bordered";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Từ Trạng thái</th><th>Đến Trạng thái</th>";
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    statusTransitions.forEach(rule => {
        rule.toStatus.forEach(toStatus => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rule.fromStatus}</td>
                <td>${toStatus}</td>
            `;
            tbody.appendChild(row);
        });
    });

    table.appendChild(tbody);
    diagram.appendChild(table);
    diagramContainer.innerHTML = '';
    diagramContainer.appendChild(diagram);
}

function setupFormSubmitHandler() {
    const form = document.getElementById("add-rule-form");
    
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const fromStatus = document.getElementById("from-status").value;
        const toStatus = document.getElementById("to-status").value;
        
        if (!fromStatus || !toStatus) {
            showErrorModal("Vui lòng chọn đầy đủ trạng thái nguồn và đích");
            return;
        }
        
        if (fromStatus === toStatus) {
            showErrorModal("Trạng thái nguồn và đích không thể giống nhau");
            return;
        }
        
        try {
            const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-transitions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fromStatus,
                    toStatus
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi API: ${response.status}`);
            }
            
            showSuccessModal();
            
            await fetchStatusTransitions();
            
            form.reset();
            
        } catch (error) {
            console.error("Lỗi khi thêm quy tắc:", error);
            showErrorModal(error.message || "Có lỗi xảy ra khi thêm quy tắc");
        }
    });
}

function showErrorModal(message) {
    document.getElementById('errorModalMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

function showSuccessModal() {
    new bootstrap.Modal(document.getElementById('successModal')).show();
}