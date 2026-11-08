import { IdBench } from '@/app/lab/IdBench'
import { MINERAL_ID_1 } from '@/app/lab/labs'
import type { LabProps } from '@/app/week/WeekPage'

export const Lab = (props: LabProps) => <IdBench config={MINERAL_ID_1} {...props} />
