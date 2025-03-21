document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        showErrorModal("Không tìm thấy mã sinh viên");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
        return;
    }

    setupIdentityTypeHandler();
    setupGeographicDropdowns();

    await Promise.all([
        fetchCountries(),
        fetchNationalities(),
        fetchDepartments(),
        fetchPrograms(),
        fetchStatusTypes()
    ]);

    await fetchStudentData(studentId);
});

function setupIdentityTypeHandler() {
    const identityTypeSelect = document.getElementById('identity-type');
    const cccdChipContainer = document.getElementById('cccd-chip-container');
    const passportContainer = document.getElementById('passport-container');

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

    if (identityTypeSelect.value === 'CCCD') {
        cccdChipContainer.style.display = 'block';
    } else if (identityTypeSelect.value === 'PASSPORT') {
        passportContainer.style.display = 'block';
    }
}

function setupGeographicDropdowns() {
    const addressTypes = ['permanent', 'temporary', 'mailing'];
    
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
        
        const provinceSelect = document.getElementById(`${type}-province`);
        provinceSelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return;
            
            const selectedProvince = this.options[this.selectedIndex];
            const geonameId = selectedProvince.getAttribute('data-geonameid');
            if (geonameId) {
                fetchDistricts(geonameId, type);
                resetDropdown(`${type}-district`);
                resetDropdown(`${type}-wardcommune`);
            }
        });
        
        const districtSelect = document.getElementById(`${type}-district`);
        districtSelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return;
            
            const selectedDistrict = this.options[this.selectedIndex];
            const geonameId = selectedDistrict.getAttribute('data-geonameid');
            if (geonameId) {
                fetchWardCommunes(geonameId, type);
                resetDropdown(`${type}-wardcommune`);
            }
        });
    });
}

function resetDropdown(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Chọn --</option>';
    select.disabled = true;
}

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
        
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const provinces = data.metadata.children.geonames;
        
        const provinceSelect = document.getElementById(`${addressType}-province`);
        provinceSelect.innerHTML = '<option value="">-- Chọn tỉnh/thành phố --</option>';
        provinceSelect.disabled = false;
        
        if (!Array.isArray(provinces) || provinces.length === 0) {
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
        
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const districts = data.metadata.children.geonames;
        
        const districtSelect = document.getElementById(`${addressType}-district`);
        districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
        districtSelect.disabled = false;
        
        if (!Array.isArray(districts) || districts.length === 0) {
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
        
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const wardCommunes = data.metadata.children.geonames;
        
        const wardCommuneSelect = document.getElementById(`${addressType}-wardcommune`);
        wardCommuneSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        wardCommuneSelect.disabled = false;
        
        if (!Array.isArray(wardCommunes) || wardCommunes.length === 0) {
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

function setDefaultNationalities() {
    const nationalitySelect = document.getElementById("student-nationality");
    nationalitySelect.innerHTML = '<option value="">-- Chọn quốc tịch --</option>';
    
    const defaultNationalities = ["Vietnamese", "American", "British", "Chinese", "French", "Japanese"];
    defaultNationalities.forEach(nationality => {
        const option = document.createElement("option");
        option.value = nationality;
        option.textContent = nationality;
        nationalitySelect.appendChild(option);
    });
}

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

async function fetchStatusTypes() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/students/status-types");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        const statusTypes = data.metadata.statusType || [];
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

async function fetchStudentData(studentId) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students?page=1&limit=100`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        const students = data.metadata.students;
        const student = students.find(s => s.studentId === studentId);

        if (!student) {
            showErrorModal("Không tìm thấy sinh viên");
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 2000);
            return;
        }

        document.getElementById('student-id').value = student.studentId;
        document.getElementById('student-name').value = student.fullName;
        
        const dob = new Date(student.dateOfBirth);
        const formattedDob = dob.toISOString().split('T')[0];
        document.getElementById('student-dob').value = formattedDob;
        
        document.getElementById('student-gender').value = student.gender;
        
        if (student.nationality) {
            const nationalitySelect = document.getElementById('student-nationality');
            
            let foundMatch = false;
            const studentNatLower = student.nationality.toLowerCase();
            
            for (let i = 0; i < nationalitySelect.options.length; i++) {
                const option = nationalitySelect.options[i];
                if (option.value.toLowerCase() === studentNatLower) {
                    nationalitySelect.selectedIndex = i;
                    foundMatch = true;
                    break;
                }
            }
            
            if (!foundMatch) {
                for (let i = 0; i < nationalitySelect.options.length; i++) {
                    const option = nationalitySelect.options[i];
                    if (option.value.toLowerCase().includes(studentNatLower) || 
                        studentNatLower.includes(option.value.toLowerCase())) {
                        nationalitySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        
        if (student.department) {
            const departmentId = typeof student.department === 'object' ? 
                student.department._id : student.department;
            
            if (departmentId) {
                document.getElementById('student-faculty').value = departmentId;
            }
        }
        
        document.getElementById('student-course').value = student.schoolYear;
        
        if (student.program) {
            const programId = typeof student.program === 'object' ? 
                student.program._id : student.program;
            
            if (programId) {
                document.getElementById('student-program').value = programId;
            }
        }
        
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-phone').value = student.phoneNumber;
        
        if (student.status) {
            const statusId = typeof student.status === 'object' ? 
                student.status._id : student.status;
            
            const statusSelect = document.getElementById('student-status');
            
            let found = false;
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === statusId) {
                    statusSelect.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                const newOption = document.createElement('option');
                newOption.value = statusId;
                
                let statusName = "Không xác định";
                if (typeof student.status === 'object' && student.status.type) {
                    statusName = student.status.type;
                }
                
                newOption.textContent = statusName;
                statusSelect.appendChild(newOption);
                statusSelect.value = statusId;
            }
        }
        
        if (student.permanentAddress) {
            loadAddressData(student.permanentAddress, 'permanent');
        }
        
        if (student.temporaryAddress) {
            loadAddressData(student.temporaryAddress, 'temporary');
        }
        
        if (student.mailingAddress) {
            loadAddressData(student.mailingAddress, 'mailing');
        }
        
        if (student.identityDocument) {
            const idType = student.identityDocument.type;
            document.getElementById('identity-type').value = idType;
            document.getElementById('identity-number').value = student.identityDocument.number || '';
            
            if (student.identityDocument.issueDate) {
                const issueDate = new Date(student.identityDocument.issueDate);
                document.getElementById('identity-issue-date').value = issueDate.toISOString().split('T')[0];
            }
            
            if (student.identityDocument.expiryDate) {
                const expiryDate = new Date(student.identityDocument.expiryDate);
                document.getElementById('identity-expiry-date').value = expiryDate.toISOString().split('T')[0];
            }
            
            document.getElementById('identity-issued-by').value = student.identityDocument.issuedBy || '';
            
            if (idType === 'CCCD') {
                document.getElementById('cccd-has-chip').value = student.identityDocument.hasChip ? 'true' : 'false';
                document.getElementById('cccd-chip-container').style.display = 'block';
            }
            
            if (idType === 'PASSPORT') {
                document.getElementById('passport-country').value = student.identityDocument.issuedCountry || 'Viet Nam';
                document.getElementById('passport-notes').value = student.identityDocument.notes || '';
                document.getElementById('passport-container').style.display = 'block';
            }
        }
        
        document.getElementById('identity-type').dispatchEvent(new Event('change'));

    } catch (error) {
        console.error("Lỗi khi lấy thông tin sinh viên:", error);
        showErrorModal("Không thể lấy thông tin sinh viên: " + error.message);
    }
}

function loadAddressData(addressData, addressType) {
    try {
        document.getElementById(`${addressType}-housestreet`).value = addressData.houseNumberStreet || '';
        
        // Set direct values for the select fields
        if (addressData.country) {
            const countrySelect = document.getElementById(`${addressType}-country`);
            countrySelect.value = addressData.country;
            countrySelect.disabled = false;
        }
        
        if (addressData.provinceCity) {
            const provinceSelect = document.getElementById(`${addressType}-province`);
            provinceSelect.innerHTML = `<option value="${addressData.provinceCity}">${addressData.provinceCity}</option>`;
            provinceSelect.disabled = false;
        }
        
        if (addressData.districtCounty) {
            const districtSelect = document.getElementById(`${addressType}-district`);
            districtSelect.innerHTML = `<option value="${addressData.districtCounty}">${addressData.districtCounty}</option>`;
            districtSelect.disabled = false;
        }
        
        if (addressData.wardCommune) {
            const wardSelect = document.getElementById(`${addressType}-wardcommune`);
            wardSelect.innerHTML = `<option value="${addressData.wardCommune}">${addressData.wardCommune}</option>`;
            wardSelect.disabled = false;
        }
    } catch (error) {
        console.error(`Lỗi khi tải dữ liệu địa chỉ ${addressType}:`, error);
    }
}

document.getElementById('edit-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const requiredFields = [
        'student-name', 'student-dob', 'student-course', 
        'student-email', 'student-phone',
        'mailing-housestreet', 
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

    if (!isValid) {
        return;
    }

    try {
        const studentId = document.getElementById('student-id').value;
        
        const mailingAddress = {
            houseNumberStreet: document.getElementById('mailing-housestreet').value,
            wardCommune: document.getElementById('mailing-wardcommune').value || "Sam", // Default if not selected
            districtCounty: document.getElementById('mailing-district').value || "Teton County", // Default if not selected
            provinceCity: document.getElementById('mailing-province').value || "Idaho", // Default if not selected
            country: document.getElementById('mailing-country').value || "United States" // Default if not selected
        };
        
        let permanentAddress = null;
        const permanentHouseStreet = document.getElementById('permanent-housestreet').value.trim();
        if (permanentHouseStreet) {
            permanentAddress = {
                houseNumberStreet: permanentHouseStreet,
                wardCommune: document.getElementById('permanent-wardcommune').value || "",
                districtCounty: document.getElementById('permanent-district').value || "",
                provinceCity: document.getElementById('permanent-province').value || "",
                country: document.getElementById('permanent-country').value || ""
            };
        }
        
        let temporaryAddress = null;
        const temporaryHouseStreet = document.getElementById('temporary-housestreet').value.trim();
        if (temporaryHouseStreet) {
            temporaryAddress = {
                houseNumberStreet: temporaryHouseStreet,
                wardCommune: document.getElementById('temporary-wardcommune').value || "",
                districtCounty: document.getElementById('temporary-district').value || "",
                provinceCity: document.getElementById('temporary-province').value || "",
                country: document.getElementById('temporary-country').value || ""
            };
        }
        
        const identityType = document.getElementById('identity-type').value;
        let identityDocument = {
            type: identityType,
            number: document.getElementById('identity-number').value,
            issueDate: document.getElementById('identity-issue-date').value,
            issuedBy: document.getElementById('identity-issued-by').value,
            expiryDate: document.getElementById('identity-expiry-date').value
        };
        
        if (identityType === 'CCCD') {
            identityDocument.hasChip = document.getElementById('cccd-has-chip').value === 'true';
        } else if (identityType === 'PASSPORT') {
            identityDocument.issuedCountry = document.getElementById('passport-country').value;
            const notes = document.getElementById('passport-notes').value.trim();
            if (notes) {
                identityDocument.notes = notes;
            }
        }
        
        const student = {
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
        
        if (permanentAddress) {
            student.permanentAddress = permanentAddress;
        }
        
        if (temporaryAddress) {
            student.temporaryAddress = temporaryAddress;
        }

        const response = await fetch(`http://127.0.0.1:3456/v1/api/students/${studentId}`, {
            method: "PATCH",
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
        console.error("Lỗi khi cập nhật sinh viên:", error);
        showErrorModal(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
});

function showErrorModal(message) {
    document.getElementById('errorModalMessage').textContent = message;
    new bootstrap.Modal(document.getElementById('errorModal')).show();
}

function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    document.getElementById('successModalClose').addEventListener('click', function () {
        window.location.href = "../index.html";
    });
}

// Hàm hỗ trợ định dạng ngày tháng thành YYYY-MM-DD
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