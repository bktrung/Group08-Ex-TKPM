<template>
    <div v-if="visible" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" v-if="selectedClass">
                        {{ $t('class.schedule') }}: {{ selectedClass.classCode }}
                    </h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>

                <div class="modal-body" v-if="selectedClass?.schedule">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr class="text-center">
                                    <th>{{ $t('days.day_of_week') }}</th>
                                    <th>{{ $t('class.room') }}</th>
                                    <th>{{ $t('class.start_period') }}</th>
                                    <th>{{ $t('class.end_period') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(schedule, index) in selectedClass.schedule" :key="index">
                                    <td class="text-center">{{ formatDayOfWeek(schedule.dayOfWeek) }}</td>
                                    <td>{{ schedule.classroom }}</td>
                                    <td class="text-center">{{ schedule.startPeriod }}</td>
                                    <td class="text-center">{{ schedule.endPeriod }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        {{ $t('common.close') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
    name: 'ScheduleModal',
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        selectedClass: {
            type: Object,
            required: false,
            default: null,
        },
    },
    emits: ['update:visible'],
    setup( _ , { emit }) {
        const { t } = useI18n()

        const closeModal = () => {
            emit('update:visible', false)
        }

        const formatDayOfWeek = (day) => {
            return t(`days.${day}`) || `${t('days.day_of_week')} ${day}`
        }

        return {
            closeModal,
            formatDayOfWeek,
        }
    },
}
</script>

<style scoped>
.modal {
    display: block;
}
</style>
