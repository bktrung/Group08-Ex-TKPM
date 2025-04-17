

## Cấu trúc source code
```
Directory structure:
└── bktrung-group08-ex-tkpm/
    ├── README.md
    ├── docker-compose.yml
    ├── package.json
    ├── backend/
    │   ├── config.json
    │   ├── Dockerfile
    │   ├── jest.config.js
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── setup_initial_data.sh
    │   ├── tsconfig.json
    │   ├── .dockerignore
    │   ├── .gitignore
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── configs/
    │   │   │   ├── config.mongodb.ts
    │   │   │   └── init.config.ts
    │   │   ├── controllers/
    │   │   │   ├── address.controller.ts
    │   │   │   ├── class.controller.ts
    │   │   │   ├── course.controller.ts
    │   │   │   ├── department.controller.ts
    │   │   │   ├── enrollment.controller.ts
    │   │   │   ├── export.controller.ts
    │   │   │   ├── grade.controller.ts
    │   │   │   ├── import.controller.ts
    │   │   │   ├── program.controller.ts
    │   │   │   ├── semester.controller.ts
    │   │   │   ├── student.controller.ts
    │   │   │   └── transcript.controller.ts
    │   │   ├── dbs/
    │   │   │   └── init.mongodb.ts
    │   │   ├── dto/
    │   │   │   ├── address/
    │   │   │   │   └── index.ts
    │   │   │   ├── class/
    │   │   │   │   └── index.ts
    │   │   │   ├── course/
    │   │   │   │   └── index.ts
    │   │   │   ├── enrollment/
    │   │   │   │   └── index.ts
    │   │   │   ├── grade/
    │   │   │   │   └── index.ts
    │   │   │   ├── semester/
    │   │   │   │   └── index.ts
    │   │   │   └── student/
    │   │   │       └── index.ts
    │   │   ├── helpers/
    │   │   │   └── asyncHandler.ts
    │   │   ├── middlewares/
    │   │   │   ├── error-logger.middleware.ts
    │   │   │   ├── upload.middleware.ts
    │   │   │   └── validation.middleware.ts
    │   │   ├── models/
    │   │   │   ├── class.model.ts
    │   │   │   ├── course.model.ts
    │   │   │   ├── department.model.ts
    │   │   │   ├── enrollment.model.ts
    │   │   │   ├── grade.model.ts
    │   │   │   ├── program.model.ts
    │   │   │   ├── semester.model.ts
    │   │   │   ├── student.model.ts
    │   │   │   ├── studentStatus.model.ts
    │   │   │   ├── studentStatusTransition.model.ts
    │   │   │   ├── hooks/
    │   │   │   │   ├── department.hook.ts
    │   │   │   │   ├── program.hook.ts
    │   │   │   │   └── student.hook.ts
    │   │   │   ├── interfaces/
    │   │   │   │   ├── class.interface.ts
    │   │   │   │   ├── course.interface.ts
    │   │   │   │   ├── department.interface.ts
    │   │   │   │   ├── enrollment.interface.ts
    │   │   │   │   ├── grade.interface.ts
    │   │   │   │   ├── program.interface.ts
    │   │   │   │   ├── semester.interface.ts
    │   │   │   │   └── student.interface.ts
    │   │   │   └── repositories/
    │   │   │       ├── class.repo.ts
    │   │   │       ├── course.repo.ts
    │   │   │       ├── department.repo.ts
    │   │   │       ├── enrollment.repo.ts
    │   │   │       ├── grade.repo.ts
    │   │   │       ├── program.repo.ts
    │   │   │       ├── semester.repo.ts
    │   │   │       └── student.repo.ts
    │   │   ├── responses/
    │   │   │   ├── error.responses.ts
    │   │   │   └── success.responses.ts
    │   │   ├── routes/
    │   │   │   ├── index.ts
    │   │   │   ├── address/
    │   │   │   │   └── index.ts
    │   │   │   ├── class/
    │   │   │   │   └── index.ts
    │   │   │   ├── course/
    │   │   │   │   └── index.ts
    │   │   │   ├── department/
    │   │   │   │   └── index.ts
    │   │   │   ├── enrollment/
    │   │   │   │   └── index.ts
    │   │   │   ├── export/
    │   │   │   │   └── index.ts
    │   │   │   ├── grade/
    │   │   │   │   └── index.ts
    │   │   │   ├── import/
    │   │   │   │   └── index.ts
    │   │   │   ├── program/
    │   │   │   │   └── index.ts
    │   │   │   ├── semester/
    │   │   │   │   └── index.ts
    │   │   │   ├── student/
    │   │   │   │   └── index.ts
    │   │   │   └── transcript/
    │   │   │       └── index.ts
    │   │   ├── services/
    │   │   │   ├── address.service.ts
    │   │   │   ├── class.service.ts
    │   │   │   ├── course.service.ts
    │   │   │   ├── department.service.ts
    │   │   │   ├── enrollment.service.ts
    │   │   │   ├── export.service.ts
    │   │   │   ├── grade.service.ts
    │   │   │   ├── import.service.ts
    │   │   │   ├── logger.service.ts
    │   │   │   ├── program.service.ts
    │   │   │   ├── semester.service.ts
    │   │   │   ├── student.service.ts
    │   │   │   └── transcript.service.ts
    │   │   ├── utils/
    │   │   │   └── index.ts
    │   │   └── validators/
    │   │       ├── class/
    │   │       │   └── add-class.validator.ts
    │   │       ├── course/
    │   │       │   ├── add-course.validator.ts
    │   │       │   └── update-course.validator.ts
    │   │       ├── semester/
    │   │       │   └── create-semester.validator.ts
    │   │       └── student/
    │   │           ├── add-student.validator.ts
    │   │           ├── import-student.validator.ts
    │   │           └── update-student.validator.ts
    │   └── tests/
    │       ├── tsconfig.json
    │       └── unit/
    │           ├── repositories/
    │           │   ├── department.repo.spec.ts
    │           │   ├── enrollment.repo.spec.ts
    │           │   └── student.repo.spec.ts
    │           └── services/
    │               └── student-status.service.spec.ts
    ├── frontend/
    │   └── moodle-system/
    │       ├── README.md
    │       ├── babel.config.js
    │       ├── Dockerfile
    │       ├── jsconfig.json
    │       ├── nginx.conf
    │       ├── package.json
    │       ├── vue.config.js
    │       ├── .dockerignore
    │       ├── .eslintrc.js
    │       ├── .gitignore
    │       ├── public/
    │       │   └── index.html
    │       └── src/
    │           ├── App.vue
    │           ├── main.js
    │           ├── assets/
    │           ├── components/
    │           │   ├── class/
    │           │   │   ├── ClassForm.vue
    │           │   │   └── ClassTable.vue
    │           │   ├── course/
    │           │   │   ├── CourseForm.vue
    │           │   │   ├── CourseList.vue
    │           │   │   └── CourseTable.vue
    │           │   ├── layout/
    │           │   │   ├── AppSidebar.vue
    │           │   │   └── BaseModal.vue
    │           │   └── student/
    │           │       ├── AddressFields.vue
    │           │       ├── IdentityDocumentFields.vue
    │           │       ├── ImportExport.vue
    │           │       └── StudentForm.vue
    │           ├── router/
    │           │   └── index.js
    │           ├── services/
    │           │   └── api.js
    │           ├── store/
    │           │   ├── index.js
    │           │   └── modules/
    │           │       ├── class.js
    │           │       ├── course.js
    │           │       ├── department.js
    │           │       ├── enrollment.js
    │           │       ├── program.js
    │           │       ├── status.js
    │           │       ├── student.js
    │           │       └── transcript.js
    │           ├── utils/
    │           │   ├── format.js
    │           │   └── validation.js
    │           └── views/
    │               ├── AcademicAffairsRegistration.vue
    │               ├── AddStudent.vue
    │               ├── ClassManage.vue
    │               ├── CourseManage.vue
    │               ├── DepartmentManage.vue
    │               ├── DropCourse.vue
    │               ├── EditStudent.vue
    │               ├── GradeTable.vue
    │               ├── ProgramManage.vue
    │               ├── RegisterCourse.vue
    │               ├── StatusManage.vue
    │               ├── StatusTransition.vue
    │               └── StudentList.vue
    └── report/
        └── Unit Testing.pptx
        └── The Broken Window Theory & The Boy Scout Rule.pdf
        
```

## Hướng dẫn cài đặt & chạy chương trình

### Sử dụng Docker

#### 1. Chuẩn bị môi trường 
Tạo file `.env.docker` trong thư mục gốc với nội dung:
```
PORT=3456
DB_HOST=mongodb
DB_PORT=27017
DB_NAME=qlsv
NODE_ENV=dev
GEONAMES_USERNAME=bktrung
API_BASE_URL=http://backend:3456/v1/api
```

#### 2. Chạy chương trình:
1. Mở Docker Desktop
2. Mở terminal trong Docker Desktop, di chuyển đến thư mục chứa project
3. Chạy lệnh `docker compose up --build`
4. Truy cập trang web tại: http://localhost:8080

### Chạy trên local

#### 1. Chuẩn bị môi trường
1. Tạo file `.env` trong thư mục backend với nội dung:
```
PORT=3456
DB_HOST=YOUR_MONGODB_HOST
DB_PORT=YOUR_MONGODB_PORT
DB_NAME=qlsv
NODE_ENV=pro
GEONAMES_USERNAME=YOUR_GEONAMES_USERNAME
```

Note: 
- Thay `YOUR_MONGODB_HOST` và `YOUR_MONGODB_PORT` thành host và port của MongoDB và sử dụng default setting.
- Thay `YOUR_GEONAMES_USERNAME` thành username lấy từ tài khoản của geonames (lên trang web để đăng ký) hoặc dùng `bktrung` để test.

#### 2. Cài đặt toàn bộ dependencies cho frontend, backend
1. Mở terminal, di chuyển tới thư mục gốc hiện tại.
2. Chạy lệnh sau `npm run install-all`

#### 3. Tạo dữ liệu ban đầu.
1. Mở git bash console, di chuyển đến thư mục backend
2. Chạy file bash `.\setup_initial_data.sh` để tạo dữ liệu ban đầu

#### 4. Chạy chương trình.
Chạy lệnh `npm run start` để chạy cả frontend và backend, sau đó truy cập vào trang web tại địa chỉ http://localhost:8080

## Hướng dẫn chạy unit test
1. Mở terminal, di chuyển tới thư mục backend
2. Chạy lệnh `npm install --save-dev jest @types/jest ts-jest mongodb-memory-server @shelf/jest-mongodb`
3. Chạy lệnh `npm run test` để chạy tất cả các unit test

## Hướng dẫn sử dụng các chức năng

#### 1. Tìm kiếm theo khoa

   Ở trang quản lí sinh viên, chọn dropwdown bên trái thanh search để lọc theo Khoa.
   
   ![Screenshot 2025-03-21 214413](https://github.com/user-attachments/assets/f860d1ce-93c5-4ab4-96df-b8a5d441da24)

#### 2. Tìm kiếm theo khoa, tên

   Nhập khoa hoặc tên vào thanh tìm kiếm để tìm kiếm sinh viên.
   
   ![Screenshot 2025-03-21 214514](https://github.com/user-attachments/assets/a7e5ae52-839e-41d8-9aa7-2c27cd19db1f)

#### 3. Thêm sinh viên.
   
   Ở trang danh sách sinh viên, chọn Thêm sinh viên, sau đó chuyển tới màn hình thêm sinh viên và điền các trường yêu cầu
   
   ![Screenshot 2025-03-21 214615](https://github.com/user-attachments/assets/4358020b-8237-434d-9392-50ecd74b8b32)

   ![Screenshot 2025-03-21 214657](https://github.com/user-attachments/assets/526410cc-bdc3-42be-a03f-8e1a52cf2e65)

#### 4. Sửa thông tin sinh viên.

   Chọn nút Sửa ở dòng của sinh viên muốn sửa, chuyển tới trang sửa sinh viên và tiến hành sửa.
   
   ![Screenshot 2025-03-21 214805](https://github.com/user-attachments/assets/642618a3-fc4d-444d-aad8-a79f7bb9b35a)

   ![Screenshot 2025-03-21 214827](https://github.com/user-attachments/assets/225963df-2bd7-4a67-81de-9bac3763fe0d)

#### 5. Xóa sinh viên.
   
   Chọn nút Xóa ở dòng của sinh viên muốn xóa, sau đó xác nhận xóa.
   
   ![Screenshot 2025-03-21 214928](https://github.com/user-attachments/assets/0859ece8-d598-4592-a67d-c8eee3aa6b73)

#### 6. Thêm, sửa khoa

   Nhấn vào "Danh sách khoa" bên thanh sidebar. Đi tới trang quản lí Khoa.
   
   Sau đó chọn "Thêm khoa". Nhấn "Lưu"
   
   ![Screenshot 2025-03-21 212926](https://github.com/user-attachments/assets/17de9d9e-3a82-432f-b416-519bfd5ca0d9)
   

   Trong màn hình quản lí khoa, chọn nút sửa ở dòng của khoa muốn sửa, sửa tên khoa và nhấn lưu
   
  ![Screenshot 2025-03-21 213447](https://github.com/user-attachments/assets/dd800699-ee2b-4e2e-9e3c-7010a9a06d21)

#### 7. Thêm, sửa tình trạng sinh viên.

   Nhấn vào "Danh sách tình trạng sinh viên" bên thanh sidebar. Đi tới trang quản lí  tình trạng sinh viên.
   
   Sau đó chọn "Thêm tình trạng". Nhấn "Lưu"
   
   ![Screenshot 2025-03-21 213727](https://github.com/user-attachments/assets/3ba78794-8826-493c-b449-5d442bce522b)

   Trong màn hình quản lí  tình trạng sinh viên, chọn nút sửa ở dòng của tình trạng muốn sửa, sửa tên tình trạng và nhấn lưu

   ![Screenshot 2025-03-21 213932](https://github.com/user-attachments/assets/374ae5a2-292e-4e85-a7e6-2ce23edfda96)

#### 8. Thêm, sửa chương trình đào tạo.

   Nhấn vào "Danh sách chương trình đào tạo" bên thanh sidebar. Đi tới trang quản lí chương trình đào tạo.
   Sau đó chọn "Thêm chương trình". Nhấn "Lưu"

   ![Screenshot 2025-03-21 214116](https://github.com/user-attachments/assets/3ed319c5-3a5a-4e91-86dd-d5a1853da182)

   Trong màn hình quản lí chương trình đào tạo, chọn nút sửa ở dòng của chương trình muốn sửa, sửa tên tình trạng và nhấn lưu

   ![Screenshot 2025-03-21 214205](https://github.com/user-attachments/assets/7138afd2-491b-4ce4-b36c-2bfbb5629d4e)

  #### 9.Logging mechanism để troubleshooting production issue & audit purposes.
  
  Vào thư mục "log" của trong thư mục "backend" để xem issue và adit purpose.
  
  ![Screenshot 2025-03-21 215131](https://github.com/user-attachments/assets/7b86e4cf-6daf-4c07-8dff-a695782b2cb5)
  
  Trong backend:
  
  ![Screenshot 2025-03-21 215152](https://github.com/user-attachments/assets/16553f9d-cfa0-4f43-aae5-89b57fb388ba)
  
  ![Screenshot 2025-03-21 215226](https://github.com/user-attachments/assets/1aa4c2be-564d-484d-b5a0-aa566348130d)
  
  Xem error:
  
  ![Screenshot 2025-03-21 215246](https://github.com/user-attachments/assets/c9857cfe-4cac-45c5-8e6a-eb2fe75daa5c)
  
  ![Screenshot 2025-03-21 215305](https://github.com/user-attachments/assets/650eb7c7-0473-4e12-bcbf-a01264ebdff6)
  
  Xem info:
  
  ![Screenshot 2025-03-21 215410](https://github.com/user-attachments/assets/57f4c241-12e9-4e40-a118-2d1804862cf0)
  
  ![Screenshot 2025-03-21 215426](https://github.com/user-attachments/assets/fea54db6-451b-4af5-a387-362163014123)

#### 10. Export file CSV, JSON, EXCEL, XML

  ![Screenshot 2025-03-21 215607](https://github.com/user-attachments/assets/4f778779-3f93-4df2-a718-591d0693cea1)
  
  ![Screenshot 2025-03-21 215626](https://github.com/user-attachments/assets/54d3845e-d9d6-43f6-8698-8f5e7585a5c7)
  
  ![Screenshot 2025-03-21 215641](https://github.com/user-attachments/assets/a0e43a4d-722b-4837-80c9-ee1a7d6993bf)

#### 11. Import file CSV, JSON, EXCEL, XML

  ![Screenshot 2025-03-21 215708](https://github.com/user-attachments/assets/7c984aa6-0492-438e-a09c-aa47f13c4e0e)
  
  ![Screenshot 2025-03-21 215731](https://github.com/user-attachments/assets/29fcf10a-8936-4aab-b1cf-c44c1f140e1d)

#### 12. Tình trạng sinh viên chỉ có thể thay đổi theo một số quy tắc

   Nhấn vào "quy tắc chuyển trạng thái" bên thanh taskbar để xem các quy tắc chuyển trạng thái sinh viên
   
   Để tạo quy tắc chuyển trạng thái, chọn trạng thái đầu và đích, sau đó chọn "Thêm quy tắc"
   
   Để xóa quy tắc chuyển trạng thái, chọn nút xóa ở dòng của quy tắc muốn xóa
   
   ![image](https://github.com/user-attachments/assets/dcfaf01d-7cb0-42c8-ade5-586c6b8032df)
   
   ![image](https://github.com/user-attachments/assets/100d0672-1e65-4541-b975-1970660628f2)

#### 13. MSSV phải là duy nhất  

   Khi tạo thêm sinh viên có MSSV đã tồn tại (ví dụ 22120401 như trong hình), thông báo lỗi xuất hiện  

   ![image](https://github.com/user-attachments/assets/5974b144-8b15-4d0f-80fb-7562ae042d1e)

   ![image](https://github.com/user-attachments/assets/6d3913df-8020-4d9b-89fe-a2eaf96a32c1)

#### 14. Email phải thuộc một tên miền nhất định và có thể cấu hình động (configurable)

   ![image](https://github.com/user-attachments/assets/3c87cc05-8834-44fa-a540-bd9bc08ccc46)
    
   ![image](https://github.com/user-attachments/assets/3ea0da76-50f0-4325-94bf-5177cca98fd8)

#### 15. Số điện thoại phải có định dạng hợp lệ theo quốc gia (configurable)

   ![image](https://github.com/user-attachments/assets/bbad0cbe-0675-466e-9930-a97619d483b6)
    
   ![image](https://github.com/user-attachments/assets/8bfba3ff-cf00-47bb-8ac1-80a2aeafad18)
    
   ![image](https://github.com/user-attachments/assets/e33eff82-5666-4981-93b6-c78cda9a06c8)

#### 16. Thêm khóa học mới
   - Nhập được thông tin: mã khóa học, tên khóa học, số tín chỉ, khoa phụ trách, mô tả, môn tiên quyết (nếu có) & hệ thống kiểm tra xem môn tiên quyết có tồn tại không trước khi lưu.
   ![image](https://github.com/user-attachments/assets/87bf099d-5afd-4ab2-a89d-de4cc7ca6fcc)
   - Khóa học phải có số tín chỉ hợp lệ (>=2).
   ![image](https://github.com/user-attachments/assets/2799f63c-65fc-4036-bf29-62e66434b8e0)
   
   
#### 17. Xóa khóa học
   - Có thể xóa khóa học chỉ trong vòng 30 phút sau khi tạo
   ![image](https://github.com/user-attachments/assets/f5298ce3-3f4c-4188-82a4-b84b25736410)
   - Chỉ có thể xóa khóa học, nếu chưa có lớp học nào được mở cho môn đó.
   ![image](https://github.com/user-attachments/assets/f917114d-a10a-4282-845e-e6b9b703067f)
   ![image](https://github.com/user-attachments/assets/4a21dc1b-5f07-4ad1-bbcf-e8f344adbe84)
   - Nếu có lớp học/sinh viên đăng ký, không thể xóa, chỉ có thể đánh dấu khóa học là không còn được mở (deactivate)
   ![image](https://github.com/user-attachments/assets/48d0d9b2-4dd2-4956-b790-6eb2af842a29)
   ![image](https://github.com/user-attachments/assets/cb712450-4f6e-413b-a4d7-c499a7b3043f)
   - Nếu khóa học bị deactivate, nó vẫn xuất hiện trong lịch sử nhưng không thể thêm lớp học mới.
   ![image](https://github.com/user-attachments/assets/76c2b521-b62d-48c9-a3e6-9b508cacdc45)
   ![image](https://github.com/user-attachments/assets/202d0fc3-0d2d-4ebb-bae9-9fe6830215cc)



#### 18. Cập nhật thông tin khóa học
   - Có thể chỉnh sửa tên khóa học, mô tả, khoa phụ trách & không thể thay đổi mã khóa học
   ![image](https://github.com/user-attachments/assets/79aee3e8-43f0-4442-b54d-09a015cb7713)
   - Không thể thay đổi số tín chỉ nếu đã có sinh viên đăng ký
   ![image](https://github.com/user-attachments/assets/b74d933d-5ab2-451c-9bd7-b78a54290ef4)

#### 19. Mở lớp học cho một khóa học cụ thể
   - Nhập thông tin: mã lớp học, mã khóa học, năm học, học kỳ, giảng viên, số lượng tối đa, lịch học, phòng học.
   ![image](https://github.com/user-attachments/assets/24c48b3a-91cd-4780-af1e-e272aa4eff2f)
   - Một khóa học có thể có nhiều lớp trong cùng một học kỳ.
   ![image](https://github.com/user-attachments/assets/b1e66149-83c9-467c-8640-e990c8449aff)

#### 20. Giáo vụ đăng kí khóa học cho sinh viên
   - Ở trang quản lí đăng kí khóa học, chọn đăng kí khóa học
     ![image](https://github.com/user-attachments/assets/0d9b757e-a281-4618-b746-b211bb986a6c)
   - Tới trang đăng kí khóa học, nhập MSSV của sinh viên cần đăng kí. Tìm kiếm khóa học muốn đăng kí, sau đó chọn lớp muốn đăng kí.
     ![image](https://github.com/user-attachments/assets/afa5b0ef-2a87-4c46-98ff-7034e636bbcd)
   - Có thể xem lịch học của lớp muốn đăng kí
     ![image](https://github.com/user-attachments/assets/990facf8-debe-4678-bd41-afada98c1ae3)

#### 21. Hủy đăng kí khóa học cho sinh viên
   - Ở trang quản lí đăng kí khóa học, chọn hủy đăng kí khóa học
     ![image](https://github.com/user-attachments/assets/0d9b757e-a281-4618-b746-b211bb986a6c)
   - Tới trang hủy đăng kí khóa học, nhập MSSV của sinh viên cần hủy đăng kí, nhập mã lớp cần hủy và lí do hủy.
     ![image](https://github.com/user-attachments/assets/19cd6b4f-0b4c-4203-98cb-d79a1e716339)
   - Tra cứu lịch sử hủy đăng kí khóa học theo MSSV
     ![image](https://github.com/user-attachments/assets/eca07072-b59b-4983-abc7-dad955923c59)

#### 22. In bản điểm chính thức
   - Ở trang Bảng điểm, nhập MSSV của sinh viên muốn in bảng điểm, nhấn Tạo bảng điểm
     ![image](https://github.com/user-attachments/assets/acdeff5f-a908-4fcd-9c49-3dd11816889a)
   - Nhấn Download PDF để tải file về











   
   
