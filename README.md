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
│       │   └── student.controller.ts
│       ├── dbs/
│       │   └── init.mongodb.ts
│       ├── dto/
│       │   └── student/
│       │       └── index.ts
│       ├── helpers/
│       │   └── asyncHandler.ts
│       ├── middlewares/
│       │   └── validation.middleware.ts
│       ├── models/
│       │   ├── student.model.ts
│       │   └── repositories/
│       │       └── student.repo.ts
│       ├── responses/
│       │   ├── error.responses.ts
│       │   └── success.responses.ts
│       ├── routes/
│       │   ├── index.ts
│       │   └── student/
│       │       └── index.ts
│       ├── services/
│       │   └── student.service.ts
│       ├── utils/
│       │   └── index.ts
│       └── validators/
│           └── student/
│               ├── add-student.validator.ts
│               └── update-student.validator.ts
└── frontend/
	├── add_student.html
	├── Dockerfile
	├── edit_student.html
	├── index.html
	├── .gitkeep
	└── scripts/
		├── add_student.js
		├── edit_student.js
		└── index.js
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
NODE_ENV=dev
```

Note: thay `YOUR_MONGODB_HOST` và `YOUR_MONGODB_PORT` thành host và port của MongoDB và sử dụng default setting.

2. Mở terminal, di chuyển đến thư mục backend
3. Chạy lệnh sau `npm install`

#### 2. Biên dịch (từ typescript thành javascript)
1. Mở terminal, di chuyển đến thư mục backend
2. Chạy lệnh sau `npm run build`

#### 3. Chạy chương trình
1. Mở terminal, di chuyển đến thư mục backend
2. Chạy lệnh sau `npm run start`
3. Mở file index.html bằng trình duyệt web