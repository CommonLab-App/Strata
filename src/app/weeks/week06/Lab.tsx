import { SEDIMENTARY_ID } from '@/app/lab/labs'
import { RockBench } from '@/app/lab/RockBench'
import type { LabProps } from '@/app/week/WeekPage'

export const Lab = (props: LabProps) => <RockBench config={SEDIMENTARY_ID} {...props} />
