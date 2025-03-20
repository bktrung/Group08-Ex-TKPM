let students = [];
let currentPage = 1;
const studentsPerPage = 10;
let totalPages = 1; 
let isSearchMode = false;
let lastSearchQuery = '';

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
        
        // Ẩn thông báo không tìm thấy kết quả
        document.getElementById('no-results').classList.add('d-none');
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
    }
}

async function searchStudents(query, page = 1) {
    try {
        // Hiển thị thông báo đang tìm kiếm (nếu cần)
        const searchInput = document.getElementById('search-input');
        
        if (!query || query.trim() === '') {

            isSearchMode = false;
            fetchStudents(1);
            return;
        }
        
        isSearchMode = true;
        lastSearchQuery = query;
        
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students/search?q=${encodeURIComponent(query)}&page=${page}&limit=${studentsPerPage}`);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.status}`);
        }
        
        const data = await response.json();
        
        students = data.metadata.students || []; // Lấy danh sách sinh viên từ kết quả tìm kiếm
        totalPages = data.metadata.pagination.totalPages || 1; // Tổng số trang từ API
        
        currentPage = page; // Cập nhật trang hiện tại
        
        // Kiểm tra nếu không có kết quả
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

// Hàm hiển thị dữ liệu lên bảng
function populateTable() {
    const tableBody = document.getElementById('student-table-body');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = `
    <tr id="row-${student.studentId}">
        <td>${student.studentId}</td>
        <td>${student.fullName}</td>
        <td>${new Date(student.dateOfBirth).toLocaleDateString()}</td>
        <td>${student.gender}</td>
        <td>${student.department}</td>
        <td>${student.schoolYear}</td>
        <td>${student.program}</td>
        <td>${student.address}</td>
        <td>${student.email}</td>
        <td>${student.phoneNumber}</td>
        <td>${student.status}</td>
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

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    pagination.innerHTML += `
<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Trước</a>
</li>`;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
    <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
    </li>`;
    }

    pagination.innerHTML += `
<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Sau</a>
</li>`;
}

function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        if (isSearchMode) {
            // Nếu đang ở chế độ tìm kiếm, gọi tìm kiếm với trang mới
            searchStudents(lastSearchQuery, page);
        } else {
            // Nếu không, gọi lấy tất cả sinh viên
            fetchStudents(page);
        }
    }
}

let selectedStudentId = null; // Lưu studentId cần xóa

function deleteStudent(studentId) {
    selectedStudentId = studentId; // Lưu ID của sinh viên cần xóa
    const student = students.find(s => s.studentId === studentId); // Tìm thông tin sinh viên
    document.getElementById("deleteStudentName").textContent = student.fullName; // Hiển thị tên sinh viên trong modal

    // Hiển thị modal xác nhận
    const deleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    deleteModal.show();
}

// Hàm chuyển hướng đến trang sửa
function editStudent(studentId) {
    window.location.href = `./pages/edit_student.html?id=${studentId}`;
}

document.addEventListener("DOMContentLoaded", () => {
    // Gọi API lấy danh sách sinh viên
    fetchStudents(currentPage);
    
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
                    
                    // Kiểm tra xem đang ở chế độ tìm kiếm hay không
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
    
    if (searchButton && searchInput) {
        // Xử lý khi nhấn nút tìm kiếm
        searchButton.addEventListener("click", function() {
            const query = searchInput.value.trim();
            searchStudents(query);
        });
        
        // Xử lý khi nhấn Enter trong ô tìm kiếm
        searchInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                const query = searchInput.value.trim();
                searchStudents(query);
            }
        });
        
        // Xử lý nút đặt lại
        const resetButton = document.getElementById("reset-button");
        if (resetButton) {
            resetButton.addEventListener("click", function() {
                searchInput.value = "";
                isSearchMode = false;
                fetchStudents(1);
            });
        }
    }
});