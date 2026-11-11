import { lazy } from 'react'
import questions08 from '@data/self-checks/week-08.json'
import { questionsSchema } from '@/app/selfcheck/questions'

export { Learn } from './Learn'
export { Explore } from './Explore'
export { Lab } from './Lab'
// Lazy: the drawings stay out of the main chunk until the Model tab opens.
export const Model = lazy(() => import('./Model').then((m) => ({ default: m.Model })))
export const questions = questionsSchema.parse(questions08)
