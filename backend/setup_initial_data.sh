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

echo "Creating status transition rules..."

# First, get all status IDs
echo "Fetching status IDs..."
STATUS_RESPONSE=$(curl -s "$API_BASE/students/status-types")

# Extract status IDs using grep and cut (basic parsing)
DANG_HOC_ID=$(echo "$STATUS_RESPONSE" | grep -o '"_id":"[^"]*","type":"Đang học"' | cut -d'"' -f4)
DA_TOT_NGHIEP_ID=$(echo "$STATUS_RESPONSE" | grep -o '"_id":"[^"]*","type":"Đã tốt nghiệp"' | cut -d'"' -f4)
DA_THOI_HOC_ID=$(echo "$STATUS_RESPONSE" | grep -o '"_id":"[^"]*","type":"Đã thôi học"' | cut -d'"' -f4)
TAM_DUNG_HOC_ID=$(echo "$STATUS_RESPONSE" | grep -o '"_id":"[^"]*","type":"Tạm dừng học"' | cut -d'"' -f4)

echo "Found status IDs:"
echo "Đang học: $DANG_HOC_ID"
echo "Đã tốt nghiệp: $DA_TOT_NGHIEP_ID"
echo "Đã thôi học: $DA_THOI_HOC_ID"
echo "Tạm dừng học: $TAM_DUNG_HOC_ID"

# Create transition: "Đang học" → "Đã tốt nghiệp"
echo "Creating transition: Đang học → Đã tốt nghiệp"
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-transitions" << EOF
{"fromStatus": "$DANG_HOC_ID", "toStatus": "$DA_TOT_NGHIEP_ID"}
EOF
echo -e "\n"

# Create transition: "Đang học" → "Đã thôi học"
echo "Creating transition: Đang học → Đã thôi học"
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-transitions" << EOF
{"fromStatus": "$DANG_HOC_ID", "toStatus": "$DA_THOI_HOC_ID"}
EOF
echo -e "\n"

# Create transition: "Đang học" → "Tạm dừng học"
echo "Creating transition: Đang học → Tạm dừng học"
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-transitions" << EOF
{"fromStatus": "$DANG_HOC_ID", "toStatus": "$TAM_DUNG_HOC_ID"}
EOF
echo -e "\n"

# Create transition: "Tạm dừng học" → "Đang học"
echo "Creating transition: Tạm dừng học → Đang học"
curl -X POST -H "Content-Type: application/json" --data-binary @- "$API_BASE/students/status-transitions" << EOF
{"fromStatus": "$TAM_DUNG_HOC_ID", "toStatus": "$DANG_HOC_ID"}
EOF
echo -e "\n"

echo "Initial data setup completed successfully!"