document.addEventListener("DOMContentLoaded", async function () {

    setupIdentityTypeHandler();
    setupGeographicDropdowns();

    await Promise.all([
        fetchCountries(),
        fetchNationalities(),
        fetchDepartments(),
        fetchPrograms(),
        fetchStatusTypes()
    ]);

});

// Thiết lập xử lý sự kiện cho loại giấy tờ tùy thân
function setupIdentityTypeHandler() {
    const identityTypeSelect = document.getElementById('identity-type');
    const cccdChipContainer = document.getElementById('cccd-chip-container');
    const passportContainer = document.getElementById('passport-container');


    identityTypeSelect.value = "CCCD"; 

    identityTypeSelect.addEventListener('change', function() {
        if (this.value === 'CCCD') {
            cccdChipContainer.style.display = 'block';
            passportContainer.style.display = 'none';
        } else if (this.value === 'PASSPORT') {
            cccdChipContainer.style.display = 'none';
            passportContainer.style.display = 'block';
        } else {
            cccdChipContainer.style.display = 'none';
            passportContainer.style.display = 'none';
        }
    });

    // Thiết lập ban đầu
    if (identityTypeSelect.value === 'CCCD') {
        cccdChipContainer.style.display = 'block';
    } else if (identityTypeSelect.value === 'PASSPORT') {
        passportContainer.style.display = 'block';
    }
}

// Thiết lập các sự kiện cho dropdown địa lý
function setupGeographicDropdowns() {
    // Các loại địa chỉ
    const addressTypes = ['permanent', 'temporary', 'mailing'];
    
    // Thiết lập sự kiện cho từng loại địa chỉ
    addressTypes.forEach(type => {
        const countrySelect = document.getElementById(`${type}-country`);
        countrySelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return;
            
            const selectedCountry = this.options[this.selectedIndex];
            const geonameId = selectedCountry.getAttribute('data-geonameid');
            if (geonameId) {
                fetchProvinces(geonameId, type);
                resetDropdown(`${type}-province`);
                resetDropdown(`${type}-district`);
                resetDropdown(`${type}-wardcommune`);
            }
        });
        
        // Khi chọn tỉnh/thành phố, tải các quận/huyện
        const provinceSelect = document.getElementById(`${type}-province`);
        provinceSelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return;
            
            const selectedProvince = this.options[this.selectedIndex];
            const geonameId = selectedProvince.getAttribute('data-geonameid');
            if (geonameId) {
                fetchDistricts(geonameId, type);
                // Reset dropdown con
                resetDropdown(`${type}-district`);
                resetDropdown(`${type}-wardcommune`);
            }
        });
        
        // Khi chọn quận/huyện, tải các phường/xã
        const districtSelect = document.getElementById(`${type}-district`);
        districtSelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return;
            
            const selectedDistrict = this.options[this.selectedIndex];
            const geonameId = selectedDistrict.getAttribute('data-geonameid');
            if (geonameId) {
                fetchWardCommunes(geonameId, type);
                // Reset dropdown con
                resetDropdown(`${type}-wardcommune`);
            }
        });
    });
}

// Reset dropdown và thêm option mặc định
function resetDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Chọn --</option>';
    select.disabled = true;
}

// Lấy danh sách quốc gia từ API
async function fetchCountries() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/address/countries");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        if (!data || !data.metadata || !data.metadata.countries) {
            console.warn('API trả về dữ liệu không đúng cấu trúc cho countries');
            return;
        }
        
        const countries = data.metadata.countries;
        
        if (!Array.isArray(countries) || countries.length === 0) {
            console.warn('Không có dữ liệu quốc gia');
            return;
        }
        
        window.countriesData = countries;
        
        const countrySelects = [
            'permanent-country', 
            'temporary-country', 
            'mailing-country',
            'passport-country'
        ];
        
        countrySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">-- Chọn quốc gia --</option>';
            
            countries.forEach(country => {
                if (!country || !country.countryName) return;
                
                const option = document.createElement("option");
                option.value = country.countryName;
                option.textContent = country.countryName;
                if (country.geonameId) {
                    option.setAttribute('data-geonameid', country.geonameId);
                }
                select.appendChild(option);
            });
            
        });
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc gia:", error);
        showErrorModal("Không thể lấy danh sách quốc gia: " + error.message);
    }
}

async function fetchProvinces(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        if (!data || !data.metadata || !data.metadata.children) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        let provinces = [];
        
        if (data.metadata.children.geonames) {
            provinces = data.metadata.children.geonames;
        } else if (Array.isArray(data.metadata.children)) {
            provinces = data.metadata.children;
        } else {
            console.warn(`Không thể xác định cấu trúc dữ liệu tỉnh/thành phố cho ${addressType}`);
            return;
        }
        
        const provinceSelect = document.getElementById(`${addressType}-province`);
        provinceSelect.innerHTML = '<option value="">-- Chọn tỉnh/thành phố --</option>';
        provinceSelect.disabled = false;
        
        if (provinces.length === 0) {
            console.warn(`Không có dữ liệu tỉnh/thành phố cho ${addressType}`);
            return;
        }
        
        provinces.forEach(province => {
            const option = document.createElement("option");
            option.value = province.toponymName || province.name || '';
            option.textContent = province.toponymName || province.name || '';
            if (province.geonameId) {
                option.setAttribute('data-geonameid', province.geonameId);
            }
            provinceSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách tỉnh/thành phố cho ${addressType}:`, error);
    }
}

async function fetchDistricts(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        if (!data || !data.metadata || !data.metadata.children) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        let districts = [];
        
        if (data.metadata.children.geonames) {
            districts = data.metadata.children.geonames;
        } else if (Array.isArray(data.metadata.children)) {
            districts = data.metadata.children;
        } else {
            console.warn(`Không thể xác định cấu trúc dữ liệu quận/huyện cho ${addressType}`);
            return;
        }
        
        const districtSelect = document.getElementById(`${addressType}-district`);
        districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
        districtSelect.disabled = false;
        
        if (districts.length === 0) {
            console.warn(`Không có dữ liệu quận/huyện cho ${addressType}`);
            return;
        }
        
        districts.forEach(district => {
            const option = document.createElement("option");
            option.value = district.toponymName || district.name || '';
            option.textContent = district.toponymName || district.name || '';
            if (district.geonameId) {
                option.setAttribute('data-geonameid', district.geonameId);
            }
            districtSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách quận/huyện cho ${addressType}:`, error);
    }
}

async function fetchWardCommunes(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        if (!data || !data.metadata || !data.metadata.children) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        let wardCommunes = [];
        
        if (data.metadata.children.geonames) {
            wardCommunes = data.metadata.children.geonames;
        } else if (Array.isArray(data.metadata.children)) {
            wardCommunes = data.metadata.children;
        } else {
            console.warn(`Không thể xác định cấu trúc dữ liệu phường/xã cho ${addressType}`);
            return;
        }
        
        const wardCommuneSelect = document.getElementById(`${addressType}-wardcommune`);
        wardCommuneSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        wardCommuneSelect.disabled = false;
        
        if (wardCommunes.length === 0) {
            console.warn(`Không có dữ liệu phường/xã cho ${addressType}`);
            return;
        }
        
        wardCommunes.forEach(wardCommune => {
            const option = document.createElement("option");
            option.value = wardCommune.toponymName || wardCommune.name || '';
            option.textContent = wardCommune.toponymName || wardCommune.name || '';
            if (wardCommune.geonameId) {
                option.setAttribute('data-geonameid', wardCommune.geonameId);
            }
            wardCommuneSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách phường/xã cho ${addressType}:`, error);
    }
}

// Lấy danh sách quốc tịch từ API
async function fetchNationalities() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/address/nationalities");
        if (!response.ok) {
            throw new Error(`Lỗi API: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.metadata || !data.metadata.nationalities) {
            console.warn('API trả về dữ liệu không đúng cấu trúc cho nationalities');
            setDefaultNationalities();
            return;
        }
        
        const nationalities = data.metadata.nationalities;
        
        if (!Array.isArray(nationalities) || nationalities.length === 0) {
            console.warn('Không có dữ liệu quốc tịch');
            setDefaultNationalities();
            return;
        }
        
        const nationalitySelect = document.getElementById("student-nationality");
        nationalitySelect.innerHTML = '<option value="">-- Chọn quốc tịch --</option>';
        
        nationalities.forEach(nationality => {
            if (!nationality) return;
            
            const option = document.createElement("option");
            option.value = nationality;
            option.textContent = nationality;
            nationalitySelect.appendChild(option);
        });
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc tịch:", error);
        setDefaultNationalities();
    }
}

// Lấy danh sách khoa từ API
async function fetchDepartments() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/departments");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const departments = data.metadata.departments;
        const facultySelect = document.getElementById("student-faculty");

        facultySelect.innerHTML = '<option value="">-- Chọn khoa --</option>';

        departments.forEach(department => {
            const option = document.createElement("option");
            option.value = department._id;
            option.textContent = department.name;
            facultySelect.appendChild(option);
        });

        window.departmentsData = departments;

    } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
        showErrorModal("Không thể lấy danh sách khoa: " + error.message);
    }
}

// Lấy danh sách chương trình đào tạo từ API
async function fetchPrograms() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/programs");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const programs = data.metadata.programs;
        const programSelect = document.getElementById("student-program");

        programSelect.innerHTML = '<option value="">-- Chọn chương trình --</option>';

        programs.forEach(program => {
            const option = document.createElement("option");
            option.value = program._id;
            option.textContent = program.name;
            programSelect.appendChild(option);
        });

        window.programsData = programs;

    } catch (error) {
        console.error("Lỗi khi lấy danh sách chương trình học:", error);
        showErrorModal("Không thể lấy danh sách chương trình học: " + error.message);
    }
}

// Lấy danh sách trạng thái sinh viên từ API
async function fetchStatusTypes() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const statusTypes = data.metadata || [];
        const statusSelect = document.getElementById("student-status");

        statusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';

        statusTypes.forEach(status => {
            const option = document.createElement("option");
            option.value = status._id;
            option.textContent = status.type;
            statusSelect.appendChild(option);
        });

        window.statusTypesData = statusTypes;

    } catch (error) {
        console.error("Lỗi khi lấy danh sách tình trạng:", error);
        showErrorModal("Không thể lấy danh sách tình trạng: " + error.message);
    }
}

// Tìm geonameId cho một địa điểm dựa trên tên
async function findGeonameId(name, parentGeonameId) {
    try {
        if (!name || !parentGeonameId) return null;
        
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${parentGeonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const locations = data.metadata.children.geonames;
        
        const location = locations.find(loc => 
            loc.toponymName.toLowerCase() === name.toLowerCase() || 
            (loc.name && loc.name.toLowerCase() === name.toLowerCase())
        );
        
        return location ? location.geonameId : null;
    } catch (error) {
        console.error("Lỗi khi tìm geonameId:", error);
        return null;
    }
}


document.getElementById('add-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const requiredFields = [
        'student-id',
        'student-name', 'student-dob', 'student-course', 
        'student-email', 'student-phone',
        'mailing-housestreet', 'mailing-province', 'mailing-district', 'mailing-country',
        'identity-number', 'identity-issue-date', 'identity-expiry-date', 'identity-issued-by'
    ];
    
    let isValid = true;

    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input || input.value.trim() === '') {
            if (input) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
            }
            isValid = false;
        } else if (input) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });

    // Kiểm tra định dạng email và số điện thoại
    const emailInput = document.getElementById('student-email');
    const phoneInput = document.getElementById('student-phone');
    const DOB = document.getElementById('student-dob');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^(\+84|0)[3|5|7|8|9][0-9]{8}$/;

    const dobValue = new Date(DOB.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (dobValue >= today) {
        DOB.classList.add('is-invalid');
        DOB.classList.remove('is-valid');
        isValid = false;
    }

    const courseInput = document.getElementById('student-course');
    const currentYear = new Date().getFullYear();

    if (parseInt(courseInput.value) > currentYear) {
        courseInput.classList.add('is-invalid');
        courseInput.classList.remove('is-valid');
        isValid = false;
    } else if (courseInput.value.trim() !== '') {
        courseInput.classList.remove('is-invalid');
        courseInput.classList.add('is-valid');
    }

    if (!emailPattern.test(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        isValid = false;
    }

    if (!phonePattern.test(phoneInput.value)) {
        phoneInput.classList.add('is-invalid');
        phoneInput.classList.remove('is-valid');
        isValid = false;
    }

    // Nếu không hợp lệ, dừng xử lý
    if (!isValid) {
        return;
    }

    try {
      
        // Chuẩn bị đối tượng địa chỉ nhận thư (bắt buộc)
        const mailingAddress = {
            houseNumberStreet: document.getElementById('mailing-housestreet').value,
            wardCommune: document.getElementById('mailing-wardcommune').value,
            districtCounty: document.getElementById('mailing-district').value,
            provinceCity: document.getElementById('mailing-province').value,
            country: document.getElementById('mailing-country').value
        };
        
        // Địa chỉ thường trú (tùy chọn) - chỉ tạo nếu có dữ liệu
        let permanentAddress = null;
        const permanentHouseStreet = document.getElementById('permanent-housestreet').value.trim();
        if (permanentHouseStreet) {
            permanentAddress = {
                houseNumberStreet: permanentHouseStreet,
                wardCommune: document.getElementById('permanent-wardcommune').value,
                districtCounty: document.getElementById('permanent-district').value,
                provinceCity: document.getElementById('permanent-province').value,
                country: document.getElementById('permanent-country').value
            };
        }
        
        // Địa chỉ tạm trú (tùy chọn) - chỉ tạo nếu có dữ liệu
        let temporaryAddress = null;
        const temporaryHouseStreet = document.getElementById('temporary-housestreet').value.trim();
        if (temporaryHouseStreet) {
            temporaryAddress = {
                houseNumberStreet: temporaryHouseStreet,
                wardCommune: document.getElementById('temporary-wardcommune').value,
                districtCounty: document.getElementById('temporary-district').value,
                provinceCity: document.getElementById('temporary-province').value,
                country: document.getElementById('temporary-country').value
            };
        }
        
        // Chuẩn bị đối tượng giấy tờ tùy thân dựa trên loại đã chọn
        const identityType = document.getElementById('identity-type').value;
        let identityDocument = {
            type: identityType,
            number: document.getElementById('identity-number').value,
            issueDate: document.getElementById('identity-issue-date').value,
            issuedBy: document.getElementById('identity-issued-by').value,
            expiryDate: document.getElementById('identity-expiry-date').value
        };
        
        // Bổ sung thông tin riêng cho từng loại giấy tờ
        if (identityType === 'CCCD') {
            identityDocument.hasChip = document.getElementById('cccd-has-chip').value === 'true';
        } else if (identityType === 'PASSPORT') {
            identityDocument.issuedCountry = document.getElementById('passport-country').value;
            const notes = document.getElementById('passport-notes').value.trim();
            if (notes) {
                identityDocument.notes = notes;
            }
        }
        
        // Chuẩn bị dữ liệu cập nhật sinh viên theo cấu trúc DTO của backend
        const student = {
            studentId: document.getElementById('student-id').value,
            fullName: document.getElementById('student-name').value,
            dateOfBirth: document.getElementById('student-dob').value,
            gender: document.getElementById('student-gender').value,
            department: document.getElementById('student-faculty').value,
            schoolYear: parseInt(document.getElementById('student-course').value),
            program: document.getElementById('student-program').value,
            mailingAddress: mailingAddress,
            email: emailInput.value,
            phoneNumber: phoneInput.value,
            status: document.getElementById('student-status').value,
            identityDocument: identityDocument,
            nationality: document.getElementById('student-nationality').value
        };

        console.log("Dữ liệu cập nhật:", student);

      
        // Thêm các địa chỉ tùy chọn nếu có
        if (permanentAddress) {
            student.permanentAddress = permanentAddress;
        }
        
        if (temporaryAddress) {
            student.temporaryAddress = temporaryAddress;
        }


        // Gửi yêu cầu cập nhật lên API
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi API: ${response.status}`);
        }

        showSuccessModal();

    } catch (error) {
        console.error("Lỗi khi thêm sinh viên:", error);
        showErrorModal(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
});

// Hiển thị modal lỗi
function showErrorModal(message) {
    document.getElementById('errorModalMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

// Hiển thị modal thành công
function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    document.getElementById('successModalClose').addEventListener('click', function () {
        window.location.href = "../index.html"; // Chuyển trang sau khi đóng modal
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Kiểm tra dữ liệu của API trả về
function checkAPIResponse(data, key) {
    if (data && data.metadata && data.metadata[key]) {
        return data.metadata[key];
    }
    return [];
}