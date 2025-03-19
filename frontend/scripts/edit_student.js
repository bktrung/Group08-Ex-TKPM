document.addEventListener("DOMContentLoaded", async function () {
    // Lấy studentId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        showErrorModal("Không tìm thấy mã sinh viên");
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 2000);
        return;
    }

    // Thiết lập xử lý sự kiện cho loại giấy tờ
    setupIdentityTypeHandler();

    // Thiết lập các sự kiện cho dropdown địa lý
    setupGeographicDropdowns();

    // Tải dữ liệu cần thiết từ API
    await Promise.all([
        fetchCountries(),
        fetchNationalities(),
        fetchDepartments(),
        fetchPrograms(),
        fetchStatusTypes()
    ]);

    // Tải thông tin sinh viên sau khi đã tải xong các danh mục
    await fetchStudentData(studentId);
});

// Thiết lập xử lý sự kiện cho loại giấy tờ tùy thân
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
        // Khi chọn quốc gia, tải các tỉnh/thành phố
        const countrySelect = document.getElementById(`${type}-country`);
        countrySelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return; // Không làm gì nếu chọn option mặc định
            
            const selectedCountry = this.options[this.selectedIndex];
            const geonameId = selectedCountry.getAttribute('data-geonameid');
            if (geonameId) {
                fetchProvinces(geonameId, type);
                // Reset các dropdown con
                resetDropdown(`${type}-province`);
                resetDropdown(`${type}-district`);
                resetDropdown(`${type}-wardcommune`);
            }
        });
        
        // Khi chọn tỉnh/thành phố, tải các quận/huyện
        const provinceSelect = document.getElementById(`${type}-province`);
        provinceSelect.addEventListener('change', function() {
            if (this.selectedIndex <= 0) return; // Không làm gì nếu chọn option mặc định
            
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
            if (this.selectedIndex <= 0) return; // Không làm gì nếu chọn option mặc định
            
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
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (!data || !data.metadata || !data.metadata.countries) {
            console.warn('API trả về dữ liệu không đúng cấu trúc cho countries');
            return;
        }
        
        const countries = data.metadata.countries;
        
        // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
        if (!Array.isArray(countries) || countries.length === 0) {
            console.warn('Không có dữ liệu quốc gia');
            return;
        }
        
        // Lưu danh sách quốc gia vào window để sử dụng sau này
        window.countriesData = countries;
        
        // Cập nhật tất cả các dropdown quốc gia
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
                // Kiểm tra dữ liệu quốc gia
                if (!country || !country.countryName) return;
                
                const option = document.createElement("option");
                option.value = country.countryName;
                option.textContent = country.countryName;
                if (country.geonameId) {
                    option.setAttribute('data-geonameid', country.geonameId);
                }
                select.appendChild(option);
            });
            
            // Không còn tự động chọn Việt Nam làm mặc định
        });
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc gia:", error);
        showErrorModal("Không thể lấy danh sách quốc gia: " + error.message);
    }
}

// Lấy danh sách tỉnh/thành phố từ API
async function fetchProvinces(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const provinces = data.metadata.children.geonames;
        
        const provinceSelect = document.getElementById(`${addressType}-province`);
        provinceSelect.innerHTML = '<option value="">-- Chọn tỉnh/thành phố --</option>';
        provinceSelect.disabled = false;
        
        // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
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
        // Không hiển thị modal lỗi vì có thể gây phiền nhiễu cho người dùng
    }
}

// Lấy danh sách quận/huyện từ API
async function fetchDistricts(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const districts = data.metadata.children.geonames;
        
        const districtSelect = document.getElementById(`${addressType}-district`);
        districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
        districtSelect.disabled = false;
        
        // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
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
        // Không hiển thị modal lỗi
    }
}

// Lấy danh sách phường/xã từ API
async function fetchWardCommunes(geonameId, addressType) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/address/children/${geonameId}`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (!data || !data.metadata || !data.metadata.children || !data.metadata.children.geonames) {
            console.warn(`API trả về dữ liệu không đúng cấu trúc cho ${addressType}`);
            return;
        }
        
        const wardCommunes = data.metadata.children.geonames;
        
        const wardCommuneSelect = document.getElementById(`${addressType}-wardcommune`);
        wardCommuneSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
        wardCommuneSelect.disabled = false;
        
        // Kiểm tra nếu không có dữ liệu hoặc mảng rỗng
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
        // Không hiển thị modal lỗi
    }
}

// Lấy danh sách quốc tịch từ API
async function fetchNationalities() {
    try {
        const response = await fetch("http://127.0.0.1:3456/v1/api/address/nationalities");
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        
        // Kiểm tra cấu trúc dữ liệu
        if (!data || !data.metadata || !data.metadata.nationalities) {
            console.warn('API trả về dữ liệu không đúng cấu trúc cho nationalities');
            return;
        }
        
        const nationalities = data.metadata.nationalities;
        
        // Kiểm tra nếu không có dữ liệu
        if (!Array.isArray(nationalities) || nationalities.length === 0) {
            console.warn('Không có dữ liệu quốc tịch');
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
        
        // Không còn tự động chọn Vietnamese làm mặc định
        
    } catch (error) {
        console.error("Lỗi khi lấy danh sách quốc tịch:", error);
        showErrorModal("Không thể lấy danh sách quốc tịch: " + error.message);
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

        // Xóa tất cả option cũ
        facultySelect.innerHTML = '<option value="">-- Chọn khoa --</option>';

        // Thêm option mới từ API
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

        // Xóa tất cả option cũ
        programSelect.innerHTML = '<option value="">-- Chọn chương trình --</option>';

        // Thêm option mới từ API
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
        const statusTypes = data.metadata.statusType || [];
        const statusSelect = document.getElementById("student-status");

        // Xóa tất cả option cũ
        statusSelect.innerHTML = '<option value="">-- Chọn trạng thái --</option>';

        // Thêm option mới từ API
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
        
        // Tìm location dựa trên tên, so sánh không phân biệt hoa thường
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

// Lấy thông tin chi tiết của sinh viên từ API
async function fetchStudentData(studentId) {
    try {
        const response = await fetch(`http://127.0.0.1:3456/v1/api/students?page=1&limit=100`);
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        console.log("Danh sách sinh viên:", data.metadata.students);
        
        const students = data.metadata.students;
        const student = students.find(s => s.studentId === studentId);

        if (!student) {
            showErrorModal("Không tìm thấy sinh viên");
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 2000);
            return;
        }

        console.log("Dữ liệu sinh viên:", student);

        // Điền thông tin cơ bản của sinh viên vào form
        document.getElementById('student-id').value = student.studentId;
        document.getElementById('student-name').value = student.fullName;
        
        // Định dạng ngày sinh
        const dob = new Date(student.dateOfBirth);
        const formattedDob = dob.toISOString().split('T')[0];
        document.getElementById('student-dob').value = formattedDob;
        
        document.getElementById('student-gender').value = student.gender;
        
        // Tìm và chọn quốc tịch
        if (student.nationality) {
            console.log("Đang tìm quốc tịch:", student.nationality);
            const nationalitySelect = document.getElementById('student-nationality');
            console.log("Các option của select quốc tịch:", Array.from(nationalitySelect.options));
            
            // Tìm option có giá trị gần giống với quốc tịch sinh viên
            for (let i = 0; i < nationalitySelect.options.length; i++) {
                const option = nationalitySelect.options[i];
                if (option.value.toLowerCase().includes(student.nationality.toLowerCase()) || 
                    student.nationality.toLowerCase().includes(option.value.toLowerCase())) {
                    nationalitySelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Tìm và chọn khoa
        if (student.department) {
            const departmentId = typeof student.department === 'object' ? 
                student.department._id : student.department;
            console.log("Department ID:", departmentId);
            
            if (departmentId) {
                document.getElementById('student-faculty').value = departmentId;
            }
        }
        
        document.getElementById('student-course').value = student.schoolYear;
        
        // Tìm và chọn chương trình đào tạo
        if (student.program) {
            const programId = typeof student.program === 'object' ? 
                student.program._id : student.program;
            console.log("Program ID:", programId);
            
            if (programId) {
                document.getElementById('student-program').value = programId;
            }
        }
        
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-phone').value = student.phoneNumber;
        
        // Tìm và chọn trạng thái
        if (student.status) {
            const statusId = typeof student.status === 'object' ? 
                student.status._id : student.status;
            console.log("Status ID:", statusId);
            
            const statusSelect = document.getElementById('student-status');
            console.log("Các option của select trạng thái:", Array.from(statusSelect.options));
            
            // Tìm option có value trùng với statusId
            let found = false;
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === statusId) {
                    statusSelect.selectedIndex = i;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.log("Không tìm thấy trạng thái với ID:", statusId);
                // Thêm option mới cho trạng thái hiện tại của sinh viên
                const newOption = document.createElement('option');
                newOption.value = statusId;
                
                // Xác định tên trạng thái
                let statusName = "Không xác định";
                if (typeof student.status === 'object' && student.status.type) {
                    statusName = student.status.type;
                }
                
                newOption.textContent = statusName;
                statusSelect.appendChild(newOption);
                statusSelect.value = statusId;
            }
        }
        
        
        // Tải và điền thông tin địa chỉ (sử dụng hàm riêng để đơn giản hóa code)
        if (student.permanentAddress) {
            await loadAddressData(student.permanentAddress, 'permanent');
        }
        
        if (student.temporaryAddress) {
            await loadAddressData(student.temporaryAddress, 'temporary');
        }
        
        if (student.mailingAddress) {
            await loadAddressData(student.mailingAddress, 'mailing');
        }
        
        // Điền thông tin giấy tờ tùy thân
        if (student.identityDocument) {
            const idType = student.identityDocument.type;
            document.getElementById('identity-type').value = idType;
            document.getElementById('identity-number').value = student.identityDocument.number || '';
            
            // Định dạng ngày cấp và ngày hết hạn
            if (student.identityDocument.issueDate) {
                const issueDate = new Date(student.identityDocument.issueDate);
                document.getElementById('identity-issue-date').value = issueDate.toISOString().split('T')[0];
            }
            
            if (student.identityDocument.expiryDate) {
                const expiryDate = new Date(student.identityDocument.expiryDate);
                document.getElementById('identity-expiry-date').value = expiryDate.toISOString().split('T')[0];
            }
            
            document.getElementById('identity-issued-by').value = student.identityDocument.issuedBy || '';
            
            // Thông tin riêng cho CCCD
            if (idType === 'CCCD') {
                document.getElementById('cccd-has-chip').value = student.identityDocument.hasChip ? 'true' : 'false';
                document.getElementById('cccd-chip-container').style.display = 'block';
            }
            
            // Thông tin riêng cho hộ chiếu
            if (idType === 'PASSPORT') {
                document.getElementById('passport-country').value = student.identityDocument.issuedCountry || 'Viet Nam';
                document.getElementById('passport-notes').value = student.identityDocument.notes || '';
                document.getElementById('passport-container').style.display = 'block';
            }
        }
        
        // Kích hoạt sự kiện change để hiển thị/ẩn các trường phù hợp
        document.getElementById('identity-type').dispatchEvent(new Event('change'));

    } catch (error) {
        console.error("Lỗi khi lấy thông tin sinh viên:", error);
        showErrorModal("Không thể lấy thông tin sinh viên: " + error.message);
    }
}

// Tải và điền thông tin địa chỉ
async function loadAddressData(addressData, addressType) {
    try {
        // Điền vào trường số nhà, đường
        document.getElementById(`${addressType}-housestreet`).value = addressData.houseNumberStreet || '';
        
        // Tìm quốc gia trong danh sách và thiết lập giá trị
        const countrySelect = document.getElementById(`${addressType}-country`);
        const countryOption = Array.from(countrySelect.options).find(option => 
            option.value.toLowerCase() === (addressData.country || '').toLowerCase() ||
            option.value.toLowerCase().includes((addressData.country || '').toLowerCase())
        );
        
        if (countryOption) {
            countrySelect.value = countryOption.value;
            // Kích hoạt sự kiện change để tải các tỉnh/thành phố
            countrySelect.dispatchEvent(new Event('change'));
            
            // Lấy geonameId của quốc gia
            const countryGeonameId = countryOption.getAttribute('data-geonameid');
            
            // Đợi API tải danh sách tỉnh/thành phố
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Tìm và chọn tỉnh/thành phố
            const provinceSelect = document.getElementById(`${addressType}-province`);
            if (addressData.provinceCity) {
                const provinceOption = Array.from(provinceSelect.options).find(option => 
                    option.value.toLowerCase() === addressData.provinceCity.toLowerCase() ||
                    option.value.toLowerCase().includes(addressData.provinceCity.toLowerCase())
                );
                
                if (provinceOption) {
                    provinceSelect.value = provinceOption.value;
                    // Kích hoạt sự kiện change để tải các quận/huyện
                    provinceSelect.dispatchEvent(new Event('change'));
                    
                    // Đợi API tải danh sách quận/huyện
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Tìm và chọn quận/huyện
                    const districtSelect = document.getElementById(`${addressType}-district`);
                    if (addressData.districtCounty) {
                        const districtOption = Array.from(districtSelect.options).find(option => 
                            option.value.toLowerCase() === addressData.districtCounty.toLowerCase() ||
                            option.value.toLowerCase().includes(addressData.districtCounty.toLowerCase())
                        );
                        
                        if (districtOption) {
                            districtSelect.value = districtOption.value;
                            // Kích hoạt sự kiện change để tải các phường/xã
                            districtSelect.dispatchEvent(new Event('change'));
                            
                            // Đợi API tải danh sách phường/xã
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // Tìm và chọn phường/xã
                            const wardCommuneSelect = document.getElementById(`${addressType}-wardcommune`);
                            if (addressData.wardCommune) {
                                const wardOption = Array.from(wardCommuneSelect.options).find(option => 
                                    option.value.toLowerCase() === addressData.wardCommune.toLowerCase() ||
                                    option.value.toLowerCase().includes(addressData.wardCommune.toLowerCase())
                                );
                                
                                if (wardOption) {
                                    wardCommuneSelect.value = wardOption.value;
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Lỗi khi tải dữ liệu địa chỉ ${addressType}:`, error);
    }
}

// Xử lý khi gửi form
document.getElementById('edit-student-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
        'student-name', 'student-dob', 'student-course', 
        'student-email', 'student-phone',
        'mailing-housestreet', 'mailing-province', 'mailing-district', 'mailing-country',
        'identity-number', 'identity-issue-date', 'identity-expiry-date', 'identity-issued-by'
    ];
    
    let isValid = true;

    // Kiểm tra từng trường bắt buộc
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

    // Kiểm tra ngày sinh không được là ngày trong tương lai
    const dobValue = new Date(DOB.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (dobValue >= today) {
        DOB.classList.add('is-invalid');
        DOB.classList.remove('is-valid');
        isValid = false;
    }

    // Kiểm tra khóa học không vượt quá năm hiện tại
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

    // Kiểm tra định dạng email
    if (!emailPattern.test(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        isValid = false;
    }

    // Kiểm tra định dạng số điện thoại
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
        const studentId = document.getElementById('student-id').value;
        
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
        
        // Thêm các địa chỉ tùy chọn nếu có
        if (permanentAddress) {
            student.permanentAddress = permanentAddress;
        }
        
        if (temporaryAddress) {
            student.temporaryAddress = temporaryAddress;
        }

        console.log("Dữ liệu cập nhật:", student);

        // Gửi yêu cầu cập nhật lên API
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