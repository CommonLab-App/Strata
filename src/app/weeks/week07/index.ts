import questions07 from '@data/self-checks/week-07.json'
import { questionsSchema } from '@/app/selfcheck/questions'

export { Learn } from './Learn'
export { Explore } from './Explore'
export { Lab } from './Lab'
export const questions = questionsSchema.parse(questions07)
