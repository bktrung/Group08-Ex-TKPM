document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3456/v1/api';
    const fromStatusSelect = document.getElementById('fromStatus');
    const toStatusSelect = document.getElementById('toStatus');
    const addTransitionForm = document.getElementById('addTransitionForm');
    const transitionRulesContainer = document.getElementById('transitionRules');
    const noRulesAlert = document.getElementById('noRules');
    
    let statuses = [];
    let transitionRules = [];
    let deleteTransitionData = { fromStatus: null, toStatus: null };
    
    const toast = new bootstrap.Toast(document.getElementById('toast'));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    
    // Fetch all status types
    async function fetchStatusTypes() {
        try {
            const response = await fetch(`${API_URL}/students/status-types`);
            const data = await response.json();
            
            if (data && data.metadata) {
                statuses = data.metadata;
                populateStatusDropdowns();
            }
        } catch (error) {
            showToast('Lỗi', `Không thể tải dữ liệu trạng thái: ${error.message}`, 'error');
        }
    }
    
    // Fetch all transition rules
    async function fetchTransitionRules() {
        try {
            const response = await fetch(`${API_URL}/students/status-transitions`);
            const data = await response.json();
            
            if (data && data.metadata) {
                transitionRules = data.metadata;
                renderTransitionRules();
            }
        } catch (error) {
            showToast('Lỗi', `Không thể tải quy tắc chuyển trạng thái: ${error.message}`, 'error');
        }
    }
    
    // Populate status dropdowns
    function populateStatusDropdowns() {
        // Clear existing options except the default one
        fromStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';
        toStatusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';
        
        // Add options for each status
        statuses.forEach(status => {
            const fromOption = document.createElement('option');
            fromOption.value = status._id;
            fromOption.textContent = status.type;
            fromStatusSelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = status._id;
            toOption.textContent = status.type;
            toStatusSelect.appendChild(toOption);
        });
    }
    
    // Render transition rules
    function renderTransitionRules() {
        transitionRulesContainer.innerHTML = '';
        
        if (transitionRules.length === 0) {
            noRulesAlert.classList.remove('d-none');
            return;
        }
        
        noRulesAlert.classList.add('d-none');
        
        // Group rules by from status
        transitionRules.forEach(rule => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            
            const card = document.createElement('div');
            card.className = 'card transition-card';
            
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header bg-info text-white';
            cardHeader.innerHTML = `<h5 class="mb-0">Từ: ${rule.fromStatus}</h5>`;
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            const heading = document.createElement('h6');
            heading.textContent = 'Có thể chuyển đến:';
            
            const destinationsDiv = document.createElement('div');
            destinationsDiv.className = 'destinations mt-2';
            
            rule.toStatus.forEach(destination => {
                const destSpan = document.createElement('span');
                destSpan.className = 'destination-status';
                destSpan.innerHTML = `
                    ${destination.type}
                    <i class="bi bi-x-circle remove-btn" 
                       data-from="${rule.fromStatusId}" 
                       data-to="${destination._id}"
                       data-from-name="${rule.fromStatus}"
                       data-to-name="${destination.type}"></i>
                `;
                destinationsDiv.appendChild(destSpan);
            });
            
            cardBody.appendChild(heading);
            cardBody.appendChild(destinationsDiv);
            
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            
            col.appendChild(card);
            transitionRulesContainer.appendChild(col);
        });
        
        // Add click event listeners to all remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const fromId = this.getAttribute('data-from');
                const toId = this.getAttribute('data-to');
                const fromName = this.getAttribute('data-from-name');
                const toName = this.getAttribute('data-to-name');
                
                showDeleteConfirmation(fromId, toId, fromName, toName);
            });
        });
    }
    
    // Add new transition rule
    async function addTransitionRule(fromStatusId, toStatusId) {
        try {
            const response = await fetch(`${API_URL}/students/status-transitions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromStatus: fromStatusId,
                    toStatus: toStatusId
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('Thành công', 'Thêm quy tắc chuyển trạng thái thành công', 'success');
                fetchTransitionRules();
            } else {
                showToast('Lỗi', data.message || 'Không thể thêm quy tắc chuyển trạng thái', 'error');
            }
        } catch (error) {
            showToast('Lỗi', `Không thể thêm quy tắc chuyển trạng thái: ${error.message}`, 'error');
        }
    }
    
    // Delete transition rule
    async function deleteTransitionRule(fromStatusId, toStatusId) {
        try {
            const response = await fetch(`${API_URL}/students/status-transitions`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromStatus: fromStatusId,
                    toStatus: toStatusId
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('Thành công', 'Xóa quy tắc chuyển trạng thái thành công', 'success');
                fetchTransitionRules();
            } else {
                showToast('Lỗi', data.message || 'Không thể xóa quy tắc chuyển trạng thái', 'error');
            }
        } catch (error) {
            showToast('Lỗi', `Không thể xóa quy tắc chuyển trạng thái: ${error.message}`, 'error');
        }
    }
    
    // Show delete confirmation modal
    function showDeleteConfirmation(fromId, toId, fromName, toName) {
        document.getElementById('deleteFromStatus').textContent = fromName;
        document.getElementById('deleteToStatus').textContent = toName;
        
        deleteTransitionData = {
            fromStatus: fromId,
            toStatus: toId
        };
        
        confirmDeleteModal.show();
    }
    
    // Show toast notification
    function showToast(title, message, type = 'info') {
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        const toastHeader = document.getElementById('toast-header');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Reset classes
        toastHeader.className = 'toast-header';
        
        // Add appropriate color class
        if (type === 'success') {
            toastHeader.classList.add('bg-success', 'text-white');
        } else if (type === 'error') {
            toastHeader.classList.add('bg-danger', 'text-white');
        } else {
            toastHeader.classList.add('bg-info', 'text-white');
        }
        
        toast.show();
    }
    
    // Event Listeners
    addTransitionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const fromStatusId = fromStatusSelect.value;
        const toStatusId = toStatusSelect.value;
        
        if (!fromStatusId || !toStatusId) {
            showToast('Lỗi', 'Vui lòng chọn cả trạng thái nguồn và đích', 'error');
            return;
        }
        
        if (fromStatusId === toStatusId) {
            showToast('Lỗi', 'Trạng thái nguồn và đích không thể giống nhau', 'error');
            return;
        }
        
        addTransitionRule(fromStatusId, toStatusId);
    });
    
    // Confirm delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        deleteTransitionRule(deleteTransitionData.fromStatus, deleteTransitionData.toStatus);
        confirmDeleteModal.hide();
    });
    
    // Initialize
    fetchStatusTypes();
    fetchTransitionRules();
});