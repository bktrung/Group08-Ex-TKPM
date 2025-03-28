

## Cấu trúc source code
```
bktrung-group08-ex-tkpm/
├── README.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── config.json
│   ├── package-lock.json
│   ├── package.json
│   ├── setup_initial_data.sh
│   ├── tsconfig.json
│   ├── .gitignore
│   └── src/
│       ├── index.ts
│       ├── configs/
│       │   ├── config.mongodb.ts
│       │   └── init.config.ts
│       ├── controllers/
│       │   ├── address.controller.ts
│       │   ├── department.controller.ts
│       │   ├── export.controller.ts
│       │   ├── import.controller.ts
│       │   ├── program.controller.ts
│       │   └── student.controller.ts
│       ├── dbs/
│       │   └── init.mongodb.ts
│       ├── dto/
│       │   ├── address/
│       │   │   └── index.ts
│       │   └── student/
│       │       └── index.ts
│       ├── helpers/
│       │   └── asyncHandler.ts
│       ├── middlewares/
│       │   ├── error-logger.middleware.ts
│       │   ├── upload.middleware.ts
│       │   └── validation.middleware.ts
│       ├── models/
│       │   ├── department.model.ts
│       │   ├── program.model.ts
│       │   ├── student.model.ts
│       │   ├── studentStatus.model.ts
│       │   ├── studentStatusTransition.model.ts
│       │   ├── hooks/
│       │   │   ├── department.hook.ts
│       │   │   ├── program.hook.ts
│       │   │   └── student.hook.ts
│       │   ├── interfaces/
│       │   │   ├── department.interface.ts
│       │   │   ├── program.interface.ts
│       │   │   └── student.interface.ts
│       │   └── repositories/
│       │       ├── department.repo.ts
│       │       ├── program.repo.ts
│       │       └── student.repo.ts
│       ├── responses/
│       │   ├── error.responses.ts
│       │   └── success.responses.ts
│       ├── routes/
│       │   ├── index.ts
│       │   ├── address/
│       │   │   └── index.ts
│       │   ├── department/
│       │   │   └── index.ts
│       │   ├── export/
│       │   │   └── index.ts
│       │   ├── import/
│       │   │   └── index.ts
│       │   ├── program/
│       │   │   └── index.ts
│       │   └── student/
│       │       └── index.ts
│       ├── services/
│       │   ├── address.service.ts
│       │   ├── department.service.ts
│       │   ├── export.service.ts
│       │   ├── import.service.ts
│       │   ├── logger.service.ts
│       │   ├── program.service.ts
│       │   └── student.service.ts
│       ├── utils/
│       │   └── index.ts
│       └── validators/
│           └── student/
│               ├── add-student.validator.ts
│               ├── import-student.validator.ts
│               └── update-student.validator.ts
└── frontend/
	├── Dockerfile
	├── index.html
	├── .gitkeep
	├── pages/
	│   ├── add_student.html
	│   ├── department_manage.html
	│   ├── edit_student.html
	│   ├── import_export.html
	│   ├── program_manage.html
	│   ├── sidebar.html
	│   ├── status_manage.html
	│   └── status_transition.html
	└── scripts/
		├── add_student.js
		├── department_manage.js
		├── edit_student.js
		├── import_export.js
		├── index.js
		├── program_manage.js
		├── sidebar.js
		├── status_manage.js
		└── status_transition.js
```

## Hướng dẫn cài đặt & chạy chương trình

### Sử dụng Docker

**Note:** File `.\setup_initial_data.sh` bị lỗi không chạy tự động cùng với docker được trên window, chỉ chạy được trên linux nên cần phải chạy thủ công file này giống **Chạy trên local**

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
4. Truy cập trang web tại: http://localhost:80

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

2. Mở terminal, di chuyển đến thư mục backend
3. Chạy lệnh sau `npm install`

#### 2. Biên dịch (từ typescript thành javascript)
1. Mở terminal, di chuyển đến thư mục backend
2. Chạy lệnh sau `npm run build`

#### 3. Chạy chương trình
1. Mở terminal, di chuyển đến thư mục backend
2. Chạy lệnh sau `npm run start`
3. Mở git bash console, di chuyển đến thư mục backend
4. Chạy file bash `.\setup_initial_data.sh` để tạo dữ liệu ban đầu
5. Mở file `index.html` trong thư mục frontend bằng trình duyệt web

## Hướng dẫn sử dụng các chức năng
1. Tìm kiếm theo khoa
   Chọn dropwdown bên trái thanh search để lọc theo Khoa.
   
   ![Screenshot 2025-03-21 214413](https://github.com/user-attachments/assets/f860d1ce-93c5-4ab4-96df-b8a5d441da24)

2. Tìm kiếm theo khoa, tên
   Nhập khoa hoặc tên để tìm kiếm sinh viên
   
   ![Screenshot 2025-03-21 214514](https://github.com/user-attachments/assets/a7e5ae52-839e-41d8-9aa7-2c27cd19db1f)

3. Thêm sinh viên.
   Ở trang danh sách sinh viên, chọn Thêm sinh viên, sau đó chuyển tới màn hình thêm sinh viên và điền các trường yêu cầu
   ![Screenshot 2025-03-21 214615](https://github.com/user-attachments/assets/4358020b-8237-434d-9392-50ecd74b8b32)

   ![Screenshot 2025-03-21 214657](https://github.com/user-attachments/assets/526410cc-bdc3-42be-a03f-8e1a52cf2e65)

6. Sửa thông tin sinh viên.
   Chọn nút Sửa ở dòng của sinh viên muốn sửa, chuyển tới trang sửa sinh viên và tiến hành sửa.
   ![Screenshot 2025-03-21 214805](https://github.com/user-attachments/assets/642618a3-fc4d-444d-aad8-a79f7bb9b35a)

   ![Screenshot 2025-03-21 214827](https://github.com/user-attachments/assets/225963df-2bd7-4a67-81de-9bac3763fe0d)

7. Xóa sinh viên.
   Chọn nút Xóa ở dòng của sinh viên muốn xóa, sau đó xác nhận xóa.
   ![Screenshot 2025-03-21 214928](https://github.com/user-attachments/assets/0859ece8-d598-4592-a67d-c8eee3aa6b73)

8. Thêm, sửa khoa
   Nhấn vào "Danh sách khoa" bên thanh sidebar. Đi tới trang quản lí Khoa.
   Sau đó chọn "Thêm khoa". Nhấn "Lưu"
   ![Screenshot 2025-03-21 212926](https://github.com/user-attachments/assets/17de9d9e-3a82-432f-b416-519bfd5ca0d9)

   Trong màn hình quản lí khoa, chọn nút sửa ở dòng của khoa muốn sửa, sửa tên khoa và nhấn lưu
  ![Screenshot 2025-03-21 213447](https://github.com/user-attachments/assets/dd800699-ee2b-4e2e-9e3c-7010a9a06d21)

9. Thêm, sửa tình trạng sinh viên.
   Nhấn vào "Danh sách tình trạng sinh viên" bên thanh sidebar. Đi tới trang quản lí  tình trạng sinh viên.
   Sau đó chọn "Thêm tình trạng". Nhấn "Lưu"
   ![Screenshot 2025-03-21 213727](https://github.com/user-attachments/assets/3ba78794-8826-493c-b449-5d442bce522b)

   Trong màn hình quản lí  tình trạng sinh viên, chọn nút sửa ở dòng của tình trạng muốn sửa, sửa tên tình trạng và nhấn lưu

   ![Screenshot 2025-03-21 213932](https://github.com/user-attachments/assets/374ae5a2-292e-4e85-a7e6-2ce23edfda96)

10. Thêm, sửa chương trình đào tạo.

   Nhấn vào "Danh sách chương trình đào tạo" bên thanh sidebar. Đi tới trang quản lí chương trình đào tạo.
   Sau đó chọn "Thêm chương trình". Nhấn "Lưu"

   ![Screenshot 2025-03-21 214116](https://github.com/user-attachments/assets/3ed319c5-3a5a-4e91-86dd-d5a1853da182)

   Trong màn hình quản lí chương trình đào tạo, chọn nút sửa ở dòng của chương trình muốn sửa, sửa tên tình trạng và nhấn lưu

   ![Screenshot 2025-03-21 214205](https://github.com/user-attachments/assets/7138afd2-491b-4ce4-b36c-2bfbb5629d4e)

11.  Logging mechanism để troubleshooting production issue & audit purposes
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

12. Export file CSV, JSON, EXCEL, XML
    ![Screenshot 2025-03-21 215607](https://github.com/user-attachments/assets/4f778779-3f93-4df2-a718-591d0693cea1)
    ![Screenshot 2025-03-21 215626](https://github.com/user-attachments/assets/54d3845e-d9d6-43f6-8698-8f5e7585a5c7)
    ![Screenshot 2025-03-21 215641](https://github.com/user-attachments/assets/a0e43a4d-722b-4837-80c9-ee1a7d6993bf)

13. Import file CSV, JSON, EXCEL, XML
    ![Screenshot 2025-03-21 215708](https://github.com/user-attachments/assets/7c984aa6-0492-438e-a09c-aa47f13c4e0e)
    ![Screenshot 2025-03-21 215731](https://github.com/user-attachments/assets/29fcf10a-8936-4aab-b1cf-c44c1f140e1d)

14. Tình trạng sinh viên chỉ có thể thay đổi theo một số quy tắc
   Nhấn vào "quy tắc chuyển trạng thái" bên thanh taskbar để xem các quy tắc chuyển trạng thái sinh viên
   Để tạo quy tắc chuyển trạng thái, chọn trạng thái đầu và đích, sau đó chọn "Thêm quy tắc"
   Để xóa quy tắc chuyển trạng thái, chọn nút xóa ở dòng của quy tắc muốn xóa
   ![image](https://github.com/user-attachments/assets/dcfaf01d-7cb0-42c8-ade5-586c6b8032df)
   ![image](https://github.com/user-attachments/assets/100d0672-1e65-4541-b975-1970660628f2)
