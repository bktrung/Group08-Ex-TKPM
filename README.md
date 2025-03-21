# Quản Lý Sinh Viên

## Cấu trúc source code
```
bktrung-group08-ex-tkpm/
├── README.md
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── src/
│       ├── index.ts
│       ├── configs/
│       │   └── config.mongodb.ts
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
	│   ├── import-export.html
	│   ├── program_manage.html
	│   ├── sidebar.html
	│   └── status_manage.html
	└── scripts/
		├── add_student.js
		├── department_manage.js
		├── edit_student.js
		├── import-export.js
		├── index.js
		├── program_manage.js
		├── sidebar.js
		└── status_manage.js
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
NODE_ENV=pro
GEONAMES_USERNAME=bktrung
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
3. Mở file `index.html` trong thư mục frontend bằng trình duyệt web