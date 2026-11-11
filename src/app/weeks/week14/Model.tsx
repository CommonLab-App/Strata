import { ModelTab, type Variant } from '@/app/models/ModelTab'

// Stub: the groundwater models are drawn per docs/superpowers/plans/2026-11-10-models.md.
export const VARIANTS: Variant[] = []

export const Model = () => <ModelTab lead="" variants={VARIANTS} />
