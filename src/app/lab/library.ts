import minerals from '@data/samples/minerals.json'
import { mineralsSchema, type Mineral } from '@/data/samples/schema'

/** The validated library, parsed once. */
export const MINERALS: Mineral[] = mineralsSchema.parse(minerals)
export const CORE_MINERALS = MINERALS.filter((m) => m.core)
export const mineralById = (id: string): Mineral | undefined => MINERALS.find((m) => m.id === id)
export const coreMineralIds = CORE_MINERALS.map((m) => m.id)
