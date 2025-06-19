

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
    │           │   ├── class.repo.spec.ts
    │           │   ├── department.repo.spec.ts
    │           │   ├── enrollment.repo.spec.ts
    │           │   └── student.repo.spec.ts
    │           ├── services/
    │           │   ├── class.service.spec.ts
    │           │   ├── course.service.spec.ts
    │           │   ├── department.service.spec.ts
    │           │   ├── enrollment.service.spec.ts
    │           │   ├── grade.service.spec.ts
    │           │   ├── logger.service.spec.ts
    │           │   ├── student.service.spec.ts
    │           │   └── transcript.service.spec.ts
    │           └── utils/
    │               └── index.spec.ts
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
```

## Hướng dẫn cài đặt & chạy chương trình

### Sử dụng Docker

#### 1. Chuẩn bị môi trường

Tạo file `.env.docker` trong thư mục gốc với nội dung:

```env
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
4. Truy cập trang web tại: [http://localhost:8080](http://localhost:8080)

### Chạy trên local

#### 1. Chuẩn bị môi trường

Tạo file `.env` trong thư mục backend với nội dung:

```env
PORT=3456
DB_HOST=YOUR_MONGODB_HOST
DB_PORT=YOUR_MONGODB_PORT
DB_NAME=qlsv
NODE_ENV=pro
GEONAMES_USERNAME=YOUR_GEONAMES_USERNAME
```

> Lưu ý:
>
> * Thay `YOUR_MONGODB_HOST` và `YOUR_MONGODB_PORT` bằng thông tin thật.
> * Có thể dùng `bktrung` làm `GEONAMES_USERNAME` để test.

#### 2. Cài đặt dependencies frontend & backend

```bash
npm run install-all
```

#### 3. Tạo dữ liệu ban đầu

```bash
cd backend
./setup_initial_data.sh
```

#### 4. Chạy chương trình

```bash
npm run start
```

Truy cập tại: [http://localhost:8080](http://localhost:8080)

---

## Hướng dẫn chạy Unit Test

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest mongodb-memory-server @shelf/jest-mongodb
npm run test
```

> Báo cáo coverage có tại `backend/coverage/lcov-report/index.html`

![Coverage](https://github.com/user-attachments/assets/9b90e774-059e-42cd-936e-74cb9201f77b)

---

## Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Sinh Viên

### 1. Tìm kiếm sinh viên

* **Theo khoa**: chọn từ dropdown
  ![Tìm theo khoa](https://github.com/user-attachments/assets/f860d1ce-93c5-4ab4-96df-b8a5d441da24)

* **Theo tên/khoa**: nhập vào thanh tìm kiếm
  ![Tìm theo khoa hoặc tên](https://github.com/user-attachments/assets/a7e5ae52-839e-41d8-9aa7-2c27cd19db1f)

### 2. Thêm sinh viên

* Click "Thêm sinh viên"
* Điền thông tin
  ![Form thêm sinh viên](https://github.com/user-attachments/assets/526410cc-bdc3-42be-a03f-8e1a52cf2e65)

### 3. Sửa / Xóa sinh viên

* **Sửa**: Click nút bút chì
  ![Sửa sinh viên](https://github.com/user-attachments/assets/225963df-2bd7-4a67-81de-9bac3763fe0d)
* **Xóa**: Click nút thùng rác → xác nhận
  ![Xóa sinh viên](https://github.com/user-attachments/assets/0859ece8-d598-4592-a67d-c8eee3aa6b73)

### 4. Quản lý Khoa / Tình trạng / CTĐT

* **Danh sách khoa**: thêm, sửa, xóa
  ![Quản lý khoa](https://github.com/user-attachments/assets/dd800699-ee2b-4e2e-9e3c-7010a9a06d21)
* **Tình trạng sinh viên**: thêm, sửa, xóa
  ![Tình trạng sinh viên](https://github.com/user-attachments/assets/374ae5a2-292e-4e85-a7e6-2ce23edfda96)
* **Chương trình đào tạo**: thêm, sửa, xóa
  ![Chương trình đào tạo](https://github.com/user-attachments/assets/7138afd2-491b-4ce4-b36c-2bfbb5629d4e)

### 5. Logging

* Mở thư mục `backend/log`
  ![Log](https://github.com/user-attachments/assets/7b86e4cf-6daf-4c07-8dff-a695782b2cb5)

### 6. Import / Export dữ liệu

* **Export**: CSV / JSON / Excel / XML
  ![Export](https://github.com/user-attachments/assets/4f778779-3f93-4df2-a718-591d0693cea1)
* **Import**: tương tự
  ![Import](https://github.com/user-attachments/assets/7c984aa6-0492-438e-a09c-aa47f13c4e0e)

### 7. Quy tắc trạng thái sinh viên

* Thêm / xóa quy tắc chuyển
  ![Quy tắc](https://github.com/user-attachments/assets/dcfaf01d-7cb0-42c8-ade5-586c6b8032df)

### 8. Ràng buộc đầu vào

* **MSSV duy nhất**, **email theo domain**, **SĐT đúng định dạng**
  ![Ràng buộc](https://github.com/user-attachments/assets/3c87cc05-8834-44fa-a540-bd9bc08ccc46)

### 9. Quản lý khóa học

* **Thêm khóa học**: mã, tên, tín chỉ, mô tả...
* **Xóa** trong 30 phút nếu chưa có lớp
* **Deactivate** nếu đã có lớp
  ![Khóa học](https://github.com/user-attachments/assets/f5298ce3-3f4c-4188-82a4-b84b25736410)
* **Chỉnh sửa** (không mã / số tín chỉ nếu có SV)

### 10. Quản lý lớp học

* **Mở lớp**, **sửa lớp**, **xóa lớp**
  ![Lớp học](https://github.com/user-attachments/assets/24c48b3a-91cd-4780-af1e-e272aa4eff2f)

### 11. Đăng ký / hủy đăng ký học phần

* **Đăng ký**: tìm MSSV → chọn lớp
* **Hủy**: nhập lý do, lưu log
  ![Hủy đăng ký](https://github.com/user-attachments/assets/19cd6b4f-0b4c-4203-98cb-d79a1e716339)

### 12. In bảng điểm

* Nhập MSSV → tạo → tải PDF
  ![PDF](https://github.com/user-attachments/assets/acdeff5f-a908-4fcd-9c49-3dd11816889a)

### 13. Đa ngôn ngữ

* Chọn icon Trái Đất để đổi ngôn ngữ
  ![i18n](https://github.com/user-attachments/assets/9dabb8d2-e54c-4a41-bd4a-2587dac6d10a)
