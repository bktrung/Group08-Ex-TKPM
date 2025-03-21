let departments = [];

async function fetchDepartments() {
    try {
        const response = await fetch('http://127.0.0.1:3456/v1/api/departments');
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }

        const data = await response.json();
        departments = data.metadata.departments;
        
        // Cập nhật dropdown danh sách khoa
        const departmentSelect = document.getElementById('departmentSelect');
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">-- Chọn khoa --</option>';
            
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept._id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
    }
}

window.exportData = function(format) {
    const url = `http://127.0.0.1:3456/v1/api/export/students?format=${format}`;
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
    
    try {
        document.getElementById('importButton').disabled = true;
        document.getElementById('importButton').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';
        
        const response = await fetch('http://127.0.0.1:3456/v1/api/import/students', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        const importResultModal = new bootstrap.Modal(document.getElementById('importResultModal'));
        
        document.getElementById('importSuccess').classList.add('d-none');
        document.getElementById('importError').classList.add('d-none');
        document.getElementById('importWarning').classList.add('d-none');
        
        if (response.ok) {
            document.getElementById('importSuccess').classList.remove('d-none');
            document.getElementById('importSummary').innerHTML = result.message;
            
            if (result.metadata.errors && result.metadata.errors.length > 0) {
                document.getElementById('importWarning').classList.remove('d-none');
                const errorList = document.getElementById('importErrorList');
                errorList.innerHTML = '';
                
                result.metadata.errors.forEach(error => {
                    const li = document.createElement('li');
                    li.textContent = error;
                    errorList.appendChild(li);
                });
            }
            
            if (typeof fetchStudents === 'function') {
                fetchStudents(1);
            }
        } else {
            document.getElementById('importError').classList.remove('d-none');
            document.getElementById('importErrorDetails').textContent = result.message || 'Có lỗi xảy ra khi import dữ liệu';
        }
        
        importResultModal.show();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    } finally {
        document.getElementById('importButton').disabled = false;
        document.getElementById('importButton').innerHTML = '<i class="bi bi-upload"></i> Import Dữ Liệu';
        
        // Reset file input
        fileInput.value = '';
    }
}

// Tạo và tải xuống tệp mẫu CSV
function downloadCSVTemplate() {
    const csvHeader = "studentId,fullName,dateOfBirth,gender,department,schoolYear,program,email,phoneNumber,status,identityDocument.type,identityDocument.number,identityDocument.issueDate,identityDocument.issuedBy,identityDocument.expiryDate,nationality,mailingAddress.houseNumberStreet,mailingAddress.wardCommune,mailingAddress.districtCounty,mailingAddress.provinceCity,mailingAddress.country";
    const csvExample = "22000001,Nguyễn Văn A,1999-01-15,Nam,Công Nghệ Thông Tin,2022,Kỹ Sư,nguyenvana@example.com,0901234567,Đang học,CMND,123456789,2015-01-01,CA TP.HCM,2025-01-01,Vietnamese,123 Đường A,Phường B,Quận C,TP.HCM,Việt Nam";
    
    const csvContent = csvHeader + "\n" + csvExample;
    
    // Tạo blob và link để tải xuống
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Tạo và tải xuống tệp mẫu JSON
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
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_import_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Hàm khởi tạo tất cả các sự kiện cho import/export
function initImportExport() {
    fetchDepartments();

    document.getElementById('export-json').addEventListener('click', function() {
        exportData('json');
    });
    document.getElementById('export-csv').addEventListener('click', function() {
        exportData('csv');
    });
    document.getElementById('export-xml').addEventListener('click', function() {
        exportData('xml');
    });
    document.getElementById('export-excel').addEventListener('click', function() {
        exportData('excel');
    });
    
    // Xử lý sự kiện checkbox lọc theo khoa
    const filterCheckbox = document.getElementById('filterByDepartment');
    const departmentSelect = document.getElementById('departmentSelect');
    
    if (filterCheckbox && departmentSelect) {
        filterCheckbox.addEventListener('change', function() {
            if (this.checked) {
                departmentSelect.classList.remove('d-none');
            } else {
                departmentSelect.classList.add('d-none');
            }
        });
    }
    
    // Xử lý sự kiện nút import
    const importButton = document.getElementById('importButton');
    if (importButton) {
        importButton.addEventListener('click', importStudentData);
    }
    
    // Xử lý sự kiện tải mẫu import
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Kiểm tra tệp đang được chọn để import
            const fileInput = document.getElementById('importFile');
            const fileName = fileInput.value || '';
            
            if (fileName.endsWith('.csv')) {
                downloadCSVTemplate();
            } else {
                // Mặc định tải mẫu JSON
                downloadJSONTemplate();
            }
        });
    }
    
    // Cập nhật loại tệp mẫu khi người dùng thay đổi tệp
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', function() {
            const fileName = this.value || '';
            const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
            
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

// Khởi tạo sự kiện khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra xem UI đã được tải chưa
    // Nếu không được gọi qua hàm initImportExport, thì tự khởi tạo
    if (document.getElementById('importButton')) {
        initImportExport();
    }
});