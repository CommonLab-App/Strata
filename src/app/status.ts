import type { ActivityStatus } from './progress/storage'

export const STATUS_LABEL: Record<ActivityStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
}
