import week03 from '@data/self-checks/week-03.json'
import { questionsSchema } from '@/app/selfcheck/questions'

export { Learn } from './Learn'
export { Explore } from './Explore'
export { Lab } from './Lab'
export const questions = questionsSchema.parse(week03)
