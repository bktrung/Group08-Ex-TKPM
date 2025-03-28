let importExportDepartments = [];

async function fetchDepartmentsForImportExport() {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/api/departments`);
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }

        const data = await response.json();
        importExportDepartments = data.metadata.departments;
        
        updateDepartmentDropdown();
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
    }
}

function updateDepartmentDropdown() {
    const departmentSelect = document.getElementById('departmentSelect');
    if (!departmentSelect) return;
    
    departmentSelect.innerHTML = '<option value="">-- Chọn khoa --</option>';
    
    importExportDepartments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept._id;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
    });
}

window.exportData = function(format) {
    const url = `${API_BASE_URL}/v1/api/export/students?format=${format}`;
    window.open(url, '_blank');
}

async function importStudentData() {
    const fileInput = document.getElementById('importFile');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Vui lòng chọn tệp để import');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const importButton = document.getElementById('importButton');
    
    try {
        setImportButtonLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/v1/api/import/students`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        displayImportResult(response.ok, result);
        
        if (response.ok && typeof fetchStudents === 'function') {
            fetchStudents(1);
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    } finally {
        setImportButtonLoading(false);
        fileInput.value = '';
    }
}

function setImportButtonLoading(isLoading) {
    const importButton = document.getElementById('importButton');
    if (!importButton) return;
    
    importButton.disabled = isLoading;
    importButton.innerHTML = isLoading 
        ? '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...'
        : '<i class="bi bi-upload"></i> Import Dữ Liệu';
}

function displayImportResult(isSuccess, result) {
    const importResultModal = new bootstrap.Modal(document.getElementById('importResultModal'));
    
    hideAllImportFeedback();
    
    if (isSuccess) {
        document.getElementById('importSuccess').classList.remove('d-none');
        document.getElementById('importSummary').innerHTML = result.message;
        
        if (result.metadata.errors && result.metadata.errors.length > 0) {
            displayImportErrors(result.metadata.errors);
        }
    } else {
        document.getElementById('importError').classList.remove('d-none');
        document.getElementById('importErrorDetails').textContent = result.message || 'Có lỗi xảy ra khi import dữ liệu';
    }
    
    importResultModal.show();
}

function hideAllImportFeedback() {
    document.getElementById('importSuccess').classList.add('d-none');
    document.getElementById('importError').classList.add('d-none');
    document.getElementById('importWarning').classList.add('d-none');
}

function displayImportErrors(errors) {
    if (!errors || errors.length === 0) return;
    
    document.getElementById('importWarning').classList.remove('d-none');
    const errorList = document.getElementById('importErrorList');
    errorList.innerHTML = '';
    
    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });
}

function downloadCSVTemplate() {
    const csvHeader = "studentId,fullName,dateOfBirth,gender,department,schoolYear,program,email,phoneNumber,status,identityDocument.type,identityDocument.number,identityDocument.issueDate,identityDocument.issuedBy,identityDocument.expiryDate,nationality,mailingAddress.houseNumberStreet,mailingAddress.wardCommune,mailingAddress.districtCounty,mailingAddress.provinceCity,mailingAddress.country";
    const csvExample = "22000001,Nguyễn Văn A,1999-01-15,Nam,Công Nghệ Thông Tin,2022,Kỹ Sư,nguyenvana@example.com,0901234567,Đang học,CMND,123456789,2015-01-01,CA TP.HCM,2025-01-01,Vietnamese,123 Đường A,Phường B,Quận C,TP.HCM,Việt Nam";
    
    const csvContent = csvHeader + "\n" + csvExample;
    downloadFile(csvContent, 'student_import_template.csv', 'text/csv;charset=utf-8;');
}

function downloadJSONTemplate() {
    const jsonTemplate = [
        {
            "studentId": "22000001",
            "fullName": "Nguyễn Văn A",
            "dateOfBirth": "1999-01-15",
            "gender": "Nam",
            "department": "Công Nghệ Thông Tin",
            "schoolYear": 2022,
            "program": "Kỹ Sư",
            "email": "nguyenvana@example.com",
            "phoneNumber": "0901234567",
            "status": "Đang học",
            "identityDocument": {
                "type": "CMND",
                "number": "123456789",
                "issueDate": "2015-01-01",
                "issuedBy": "CA TP.HCM",
                "expiryDate": "2025-01-01"
            },
            "nationality": "Vietnamese",
            "mailingAddress": {
                "houseNumberStreet": "123 Đường A",
                "wardCommune": "Phường B",
                "districtCounty": "Quận C",
                "provinceCity": "TP.HCM",
                "country": "Việt Nam"
            }
        }
    ];
    
    const jsonString = JSON.stringify(jsonTemplate, null, 2);
    downloadFile(jsonString, 'student_import_template.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setupEventListeners() {
    document.getElementById('export-json')?.addEventListener('click', () => exportData('json'));
    document.getElementById('export-csv')?.addEventListener('click', () => exportData('csv'));
    document.getElementById('export-xml')?.addEventListener('click', () => exportData('xml'));
    document.getElementById('export-excel')?.addEventListener('click', () => exportData('excel'));
    
    const filterCheckbox = document.getElementById('filterByDepartment');
    const departmentSelect = document.getElementById('departmentSelect');
    
    if (filterCheckbox && departmentSelect) {
        filterCheckbox.addEventListener('change', function() {
            departmentSelect.classList.toggle('d-none', !this.checked);
        });
    }
    
    document.getElementById('importButton')?.addEventListener('click', importStudentData);
    
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('importFile');
            const fileName = fileInput.value || '';
            
            fileName.endsWith('.csv') ? downloadCSVTemplate() : downloadJSONTemplate();
        });
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', function() {
            const fileName = this.value || '';
            const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
            
            if (!downloadTemplateBtn) return;
            
            if (fileName.endsWith('.csv')) {
                downloadTemplateBtn.textContent = 'Tải mẫu CSV';
            } else if (fileName.endsWith('.json')) {
                downloadTemplateBtn.textContent = 'Tải mẫu JSON';
            } else {
                downloadTemplateBtn.textContent = 'Tải mẫu';
            }
        });
    }
}

function initImportExport() {
    fetchDepartmentsForImportExport();
    setupEventListeners();
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('importButton')) {
        initImportExport();
    }
});