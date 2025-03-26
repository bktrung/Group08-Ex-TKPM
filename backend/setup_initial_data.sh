#!/bin/bash

# Set the API base URL
API_BASE=${API_BASE_URL:-"http://localhost:3456/v1/api"}

echo "Setting up initial data..."

# Create Departments
echo "Creating departments..."
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/departments" << EOF
{"name": "Luật"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/departments" << EOF
{"name": "Tiếng Anh thương mại"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/departments" << EOF
{"name": "Tiếng Nhật"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/departments" << EOF
{"name": "Tiếng Pháp"}
EOF
echo -e "\n"

# Create Student Status Types
echo "Creating student status types..."
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-types" << EOF
{"type": "Đang học"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-types" << EOF
{"type": "Đã tốt nghiệp"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-types" << EOF
{"type": "Đã thôi học"}
EOF
echo -e "\n"

curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-types" << EOF
{"type": "Tạm dừng học"}
EOF
echo -e "\n"

# Create Programs
echo "Creating programs..."
curl -X POST -H "Content-Type: application/json" -d '{"name": "CQ"}' "$API_BASE/programs"
echo -e "\n"
curl -X POST -H "Content-Type: application/json" -d '{"name": "CLC"}' "$API_BASE/programs"
echo -e "\n"
curl -X POST -H "Content-Type: application/json" -d '{"name": "VN"}' "$API_BASE/programs"
echo -e "\n"
curl -X POST -H "Content-Type: application/json" -d '{"name": "VP"}' "$API_BASE/programs"
echo -e "\n"

echo "Initial data setup completed successfully!"