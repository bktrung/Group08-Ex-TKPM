<template>
  <div class="row mb-3 mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">{{ $t('student.import_export_title') }}</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 border-end">
              <h6 class="mb-3">{{ $t('student.export.title') }}</h6>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-outline-primary" @click="exportData('json')">
                  <i class="bi bi-file-earmark-code"></i> JSON
                </button>
                <button class="btn btn-outline-success" @click="exportData('csv')">
                  <i class="bi bi-file-earmark-spreadsheet"></i> CSV
                </button>
                <button class="btn btn-outline-danger" @click="exportData('xml')">
                  <i class="bi bi-file-earmark-text"></i> XML
                </button>
                <button class="btn btn-outline-info" @click="exportData('excel')">
                  <i class="bi bi-file-earmark-excel"></i> Excel
                </button>
              </div>
            </div>

            <div class="col-md-6">
              <h6 class="mb-3">{{ $t('student.import.title') }}</h6>
              <form @submit.prevent="importData" enctype="multipart/form-data">
                <div class="mb-3">
                  <label for="importFile" class="form-label">{{ $t('student.import.label') }}</label>
                  <input type="file" class="form-control" id="importFile" ref="fileInput"
                    accept=".csv, .json, .xml, .xlsx, .xls" @change="handleFileChange">
                  <div class="form-text">{{ $t('student.import.supported') }}.</div>
                </div>
                <button type="button" class="btn btn-primary" @click="importData" :disabled="loading || !selectedFile">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"
                    aria-hidden="true"></span>
                  <i v-else class="bi bi-upload"></i> {{ $t('student.import.title') }}
                </button>
                <button type="button" class="btn btn-link" @click="showHelpModal">
                  <i class="bi bi-question-circle"></i> {{ $t('student.import.view_help') }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Import Result Modal -->
  <div class="modal fade" id="importResultModal" tabindex="-1" aria-hidden="true" ref="importResultModalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('student.import.result.title') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div id="importSuccess" class="alert alert-success" v-if="importResult.success">
            <div>{{ importResult.message }}</div>
          </div>
          <div id="importError" class="alert alert-danger" v-if="!importResult.success">
            <div>{{ importResult.message }}</div>
          </div>
          <div id="importWarning" v-if="importResult.errors && importResult.errors.length">
            <h6>{{ $t('common.error_detail') }}:</h6>
            <ul class="mt-2">
              <li v-for="(error, index) in importResult.errors" :key="index">{{ error }}</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Import Help Modal -->
  <div class="modal fade" id="importHelpModal" tabindex="-1" aria-hidden="true" ref="helpModalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('student.import.help.title') }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h6>{{ $t('student.import.help.csv_structure') }}</h6>
          <p>{{ $t('student.import.help.csv_columns') }}:</p>
          <pre class="bg-light p-2">
  studentId,fullName,dateOfBirth,gender,department,schoolYear,program,mailingAddress.houseNumberStreet,mailingAddress.wardCommune,mailingAddress.districtCounty,mailingAddress.provinceCity,mailingAddress.country,email,phoneNumber,status,identityDocument.type,identityDocument.number,identityDocument.issueDate,identityDocument.issuedBy,identityDocument.expiryDate,identityDocument.hasChip,nationality
  23456788,Nguyen Van C,2004-01-01,Nam,Khoa Công nghệ Thông tin,2022,Kỹ thuật Phần mềm,425/23 Thu KHoa Huan,Springfield,City of Belfast,Northern Ireland,United Kingdom,nguyenvanc@test.com,0987654356,Đang học,CCCD,038204012567,2018-02-03,Cong An Phuong,2030-03-02,true,Moroccan
            </pre>

          <h6 class="mt-3">{{ $t('student.import.help.json_structure') }}</h6>
          <p>{{ $t('student.import.help.json_required') }}</p>
          <pre class="bg-light p-2">
                {
                    "studentId": "22000001",
                    "fullName": "Nguyễn Văn A",
                    "dateOfBirth": "1999-01-15",
                    "gender": "Nam",
                    "department": "Khoa Công nghệ Thông tin",
                    "schoolYear": 2022,
                    "program": "Kỹ thuật Phần mềm",
                    "email": "nguyenvana@example.com",
                    "phoneNumber": "0901234567",
                    "status": "Đang học",
                    "identityDocument": {
                        "type": "CCCD",
                        "hasChip": "true",	
                        "number": "038204012567",
                        "issueDate": "2018-02-03",
                        "issuedBy": "Cong An Phuong",
                        "expiryDate": "2030-03-02"
                    },
                    "nationality": "Vietnamese",
                    "mailingAddress": {
                        "houseNumberStreet": "425/23 Thu KHoa Huan",
                        "wardCommune": "null",
                        "districtCounty": "Husbands",
                        "provinceCity": "Saint James",
                        "country": "Barbados"
                    }
                }
            </pre>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
          <button @click="downloadTemplate" class="btn btn-primary">{{ $t('common.download_template') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ImportExport',
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const loading = ref(false)
    const importResultModalRef = ref(null)
    const helpModalRef = ref(null)
    let importResultModal = null
    let helpModal = null

    const importResult = ref({
      success: false,
      message: '',
      errors: []
    })

    const handleFileChange = (event) => {
      selectedFile.value = event.target.files[0] || null
    }

    const exportData = (format) => {
      store.dispatch('student/exportStudents', format)
    }

    const importData = async () => {
      if (!selectedFile.value) {
        alert(t('student.import.validation.file_required'))
        return
      }

      loading.value = true

      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)

        const result = await store.dispatch('student/importStudents', formData)

        importResult.value = {
          success: result.status === 200 || result.status === 201,
          message: result.message || t('student.import.result.success'),
          errors: result.metadata?.errors || []
        }

        if (importResultModal) {
          importResultModal.show()
        }

        if (importResult.value.success) {
          await store.dispatch('student/fetchStudents', { page: 1 })
        }
      } catch (error) {
        importResult.value = {
          success: false,
          message: `Lỗi: ${error.message}`,
          errors: []
        }

        if (importResultModal) {
          importResultModal.show()
        }
      } finally {
        loading.value = false
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        selectedFile.value = null
      }
    }

    const showHelpModal = () => {
      if (helpModal) {
        helpModal.show()
      }
    }

    const downloadTemplate = () => {
      const fileType = selectedFile.value ?
        selectedFile.value.name.split('.').pop().toLowerCase() : 'csv'

      if (fileType === 'json') {
        downloadJSONTemplate()
      } else {
        downloadCSVTemplate()
      }
    }

    const downloadCSVTemplate = () => {
      const csvHeader = "studentId,fullName,dateOfBirth,gender,department,schoolYear,program,email,phoneNumber,status,identityDocument.type,identityDocument.number,identityDocument.issueDate,identityDocument.issuedBy,identityDocument.expiryDate,nationality,mailingAddress.houseNumberStreet,mailingAddress.wardCommune,mailingAddress.districtCounty,mailingAddress.provinceCity,mailingAddress.country"
      const csvExample = "22000001,Nguyễn Văn A,1999-01-15,Nam,Công Nghệ Thông Tin,2022,Kỹ Sư,nguyenvana@example.com,0901234567,Đang học,CMND,123456789,2015-01-01,CA TP.HCM,2025-01-01,Vietnamese,123 Đường A,Phường B,Quận C,TP.HCM,Việt Nam"

      const csvContent = csvHeader + "\n" + csvExample
      downloadFile(csvContent, 'student_import_template.csv', 'text/csv;charset=utf-8;')
    }

    const downloadJSONTemplate = () => {
      const jsonTemplate = [
        {
          "studentId": "22000001",
          "fullName": "Nguyễn Văn A",
          "dateOfBirth": "1999-01-15",
          "gender": "Nam",
          "department": "Công Nghệ Thông Tin",
          "schoolYear": 2022,
          "program": "Kỹ Sư",
          "email": "nguyenvana@example.com",
          "phoneNumber": "0901234567",
          "status": "Đang học",
          "identityDocument": {
            "type": "CMND",
            "number": "123456789",
            "issueDate": "2015-01-01",
            "issuedBy": "CA TP.HCM",
            "expiryDate": "2025-01-01"
          },
          "nationality": "Vietnamese",
          "mailingAddress": {
            "houseNumberStreet": "123 Đường A",
            "wardCommune": "Phường B",
            "districtCounty": "Quận C",
            "provinceCity": "TP.HCM",
            "country": "Việt Nam"
          }
        }
      ]

      const jsonString = JSON.stringify(jsonTemplate, null, 2)
      downloadFile(jsonString, 'student_import_template.json', 'application/json')
    }

    const downloadFile = (content, filename, contentType) => {
      const blob = new Blob([content], { type: contentType })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    onMounted(() => {
      const importResultModalElement = document.getElementById('importResultModal')
      if (importResultModalElement) {
        importResultModal = new Modal(importResultModalElement)
      }

      const helpModalElement = document.getElementById('importHelpModal')
      if (helpModalElement) {
        helpModal = new Modal(helpModalElement)
      }
    })

    return {
      fileInput,
      selectedFile,
      loading,
      importResult,
      importResultModalRef,
      helpModalRef,
      handleFileChange,
      exportData,
      importData,
      showHelpModal,
      downloadTemplate
    }
  }
}
</script>