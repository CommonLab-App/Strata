import rocks from '@data/samples/rocks.json'
import { rocksSchema, type Rock } from '@/data/samples/schema'

export const ROCKS: Rock[] = rocksSchema.parse(rocks)
export const rockById = (id: string): Rock | undefined => ROCKS.find((r) => r.id === id)
export const coreRockIds = (cls: Rock['class']) => ROCKS.filter((r) => r.core && r.class === cls).map((r) => r.id)
