import questions05 from '@data/self-checks/week-05.json'
import { questionsSchema } from '@/app/selfcheck/questions'

export { Learn } from './Learn'
export { Explore } from './Explore'
export { Lab } from './Lab'
export const questions = questionsSchema.parse(questions05)
