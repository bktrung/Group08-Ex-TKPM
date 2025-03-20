let students = [];
let currentPage = 1;
const studentsPerPage = 10;
let totalPages = 1; 
let isSearchMode = false;
let lastSearchQuery = '';
let departments = [];
let selectedDepartment = '';


async function fetchStudents(page = 1) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students?page=${page}&limit=${studentsPerPage}`);
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }

        const data = await response.json();

        students = data.metadata.students;
        totalPages = data.metadata.pagination.totalPages;

        currentPage = page; 
        populateTable();
        
        document.getElementById('no-results').classList.add('d-none');
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
    }
}

async function fetchDepartments() {
    try {
        const response = await fetch('http://127.0.0.1:3456/v1/api/departments');
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }

        const data = await response.json();
        departments = data.metadata.departments;
        
        populateDepartmentDropdown();
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
    }
}

function populateDepartmentDropdown() {
    const departmentSelect = document.getElementById('department-select');
    
    departmentSelect.innerHTML = '<option value="">Tất cả khoa</option>';
    
    // Sắp xếp khoa theo tên
    departments.sort((a, b) => a.name.localeCompare(b.name));
    
    departments.forEach(department => {
        departmentSelect.innerHTML += `<option value="${department._id}">${department.name}</option>`;
    });
}

async function searchStudents(query, page = 1) {
    try {
        const searchInput = document.getElementById('search-input');
        
        if (!query && !selectedDepartment) {
            isSearchMode = false;
            fetchStudents(1);
            return;
        }
        
        isSearchMode = true;
        lastSearchQuery = query;
        
        let url;
        
        if (selectedDepartment && !query) {
            // Tìm kiếm chỉ theo khoa
            url = `http://127.0.0.1:3456/v1/api/students/department/${selectedDepartment}?page=${page}&limit=${studentsPerPage}`;
        } else if (query && selectedDepartment) {
            // Lấy sinh viên theo khoa trước
            const studentsInDept = await fetch(`http://127.0.0.1:3456/v1/api/students/department/${selectedDepartment}?page=1&limit=1000`);
            if (!studentsInDept.ok) {
                throw new Error(`Lỗi mạng: ${studentsInDept.status}`);
            }
            
            const deptData = await studentsInDept.json();
            const deptStudents = deptData.metadata.students || [];
            
            // Lọc theo tên/MSSV từ danh sách sinh viên của khoa
            const filteredStudents = deptStudents.filter(student => 
                student.fullName.toLowerCase().includes(query.toLowerCase()) || 
                student.studentId.toLowerCase().includes(query.toLowerCase())
            );
            
            // Tạo phân trang
            const totalItems = filteredStudents.length;
            const totalPages = Math.ceil(totalItems / studentsPerPage);
            const startIdx = (page - 1) * studentsPerPage;
            const endIdx = Math.min(startIdx + studentsPerPage, totalItems);
            
            students = filteredStudents.slice(startIdx, endIdx);
            currentPage = page;
            
            if (students.length === 0) {
                document.getElementById('no-results').classList.remove('d-none');
            } else {
                document.getElementById('no-results').classList.add('d-none');
            }
            
            populateTable();
            updatePagination();
            return;
        } else if (query) {
            // Chỉ tìm kiếm theo query
            url = `http://127.0.0.1:3456/v1/api/students/search?q=${encodeURIComponent(query)}&page=${page}&limit=${studentsPerPage}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }
        
        const data = await response.json();
        
        students = data.metadata.students || [];
        totalPages = data.metadata.pagination.totalPages || 1;
        
        currentPage = page;
        
        if (students.length === 0) {
            document.getElementById('no-results').classList.remove('d-none');
        } else {
            document.getElementById('no-results').classList.add('d-none');
        }
        
        populateTable();
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sinh viên:", error);
    }
}

function populateTable() {
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const departmentName = typeof student.department === 'object' ? student.department.name : student.department;
        const programName = typeof student.program === 'object' ? student.program.name : student.program;
        const statusType = typeof student.status === 'object' ? student.status.type : student.status;
        
        const row = `
    <tr id="row-${student.studentId}">
        <td>${student.studentId}</td>
        <td>${student.fullName}</td>
        <td>${new Date(student.dateOfBirth).toLocaleDateString()}</td>
        <td>${student.gender}</td>
        <td>${departmentName}</td>
        <td>${student.schoolYear}</td>
        <td>${programName}</td>
        <td>${formatAddress(student.mailingAddress)}</td>
        <td>${student.email}</td>
        <td>${student.phoneNumber}</td>
        <td>${statusType}</td>
        <td class="text-center">
            <button class="btn btn-warning btn-sm me-1" onclick="editStudent('${student.studentId}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.studentId}')">Xóa</button>
        </td>
    </tr>
`;
        tableBody.innerHTML += row;
    });

    updatePagination();
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.houseNumberStreet}, ${address.wardCommune}, ${address.districtCounty}, ${address.provinceCity}`;
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages === 0) {
        return;
    }

    pagination.innerHTML += `
<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Trước</a>
</li>`;

    // Hiển thị tối đa 5 trang nếu có nhiều trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Điều chỉnh lại nếu không đủ 5 trang
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Hiển thị trang đầu tiên nếu không nằm trong khoảng hiển thị
    if (startPage > 1) {
        pagination.innerHTML += `
        <li class="page-item">
            <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
        </li>`;
        
        if (startPage > 2) {
            pagination.innerHTML += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.innerHTML += `
    <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
    </li>`;
    }
    
    // Hiển thị trang cuối nếu không nằm trong khoảng hiển thị
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.innerHTML += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>`;
        }
        
        pagination.innerHTML += `
        <li class="page-item">
            <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
        </li>`;
    }

    pagination.innerHTML += `
<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Sau</a>
</li>`;
}

function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        if (isSearchMode) {
            searchStudents(lastSearchQuery, page);
        } else {
            fetchStudents(page);
        }
    }
}

let selectedStudentId = null;

function deleteStudent(studentId) {
    selectedStudentId = studentId;
    const student = students.find(s => s.studentId === studentId);
    document.getElementById("deleteStudentName").textContent = student.fullName;

    const deleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    deleteModal.show();
}

function editStudent(studentId) {
    window.location.href = `./pages/edit_student.html?id=${studentId}`;
}

function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    selectedDepartment = document.getElementById('department-select').value;
    
    searchStudents(query);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchStudents(currentPage);
    fetchDepartments();
    
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async function () {
            if (!selectedStudentId) return;

            try {
                const response = await fetch(`http://127.0.0.1:3456/v1/api/students/${selectedStudentId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.ok) {
                    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
                    deleteModal.hide();
                    
                    if (isSearchMode) {
                        searchStudents(lastSearchQuery, currentPage);
                    } else {
                        fetchStudents(currentPage);
                    }
                } else {
                    console.error("Lỗi khi xóa sinh viên:", await response.text());
                }
            } catch (error) {
                console.error("Lỗi mạng:", error);
            }
        });
    }
    
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    const departmentSelect = document.getElementById("department-select");
    
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", performSearch);
        
        searchInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                performSearch();
            }
        });
        
        if (departmentSelect) {
            departmentSelect.addEventListener("change", performSearch);
        }
        
        const resetButton = document.getElementById("reset-button");
        if (resetButton) {
            resetButton.addEventListener("click", function() {
                searchInput.value = "";
                departmentSelect.value = "";
                selectedDepartment = "";
                isSearchMode = false;
                fetchStudents(1);
            });
        }
    }
});