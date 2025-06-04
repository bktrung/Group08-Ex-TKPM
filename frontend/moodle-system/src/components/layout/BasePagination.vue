<template>
    <nav v-if="totalPages >= 1">
        <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="emitChange(currentPage - 1)">
                    {{ $t('common.previous') }}
                </a>
            </li>

            <li v-if="startPage > 1" class="page-item">
                <a class="page-link" href="#" @click.prevent="emitChange(1)">1</a>
            </li>

            <li v-if="startPage > 2" class="page-item disabled">
                <span class="page-link">...</span>
            </li>

            <li v-for="page in paginationPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <a class="page-link" href="#" @click.prevent="emitChange(page)">{{ page }}</a>
            </li>

            <li v-if="endPage < totalPages - 1" class="page-item disabled">
                <span class="page-link">...</span>
            </li>

            <li v-if="endPage < totalPages" class="page-item">
                <a class="page-link" href="#" @click.prevent="emitChange(totalPages)">{{ totalPages }}</a>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="emitChange(currentPage + 1)">
                    {{ $t('common.next') }}
                </a>
            </li>
        </ul>
    </nav>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
    name: 'BasePagination',
    props: {
        currentPage: {
            type: Number,
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        },
        maxVisible: {
            type: Number,
            default: 5
        }
    },
    emits: ['change'],
    setup(props, { emit }) {
        const { t } = useI18n()

        const startPage = computed(() => {
            const half = Math.floor(props.maxVisible / 2)
            return Math.max(1, props.currentPage - half)
        })

        const endPage = computed(() => {
            return Math.min(props.totalPages, startPage.value + props.maxVisible - 1)
        })

        const paginationPages = computed(() => {
            const pages = []
            for (let i = startPage.value; i <= endPage.value; i++) {
                pages.push(i)
            }
            return pages
        })

        const emitChange = (page) => {
            if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
                emit('change', page)
            }
        }

        return {
            t,
            startPage,
            endPage,
            paginationPages,
            emitChange
        }
    }
}
</script>
