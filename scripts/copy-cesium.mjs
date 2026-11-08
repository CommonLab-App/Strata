// Copies the assets Cesium loads at runtime into public/cesium/, where CESIUM_BASE_URL (vite.config.ts) points.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
const from = 'node_modules/cesium/Build/Cesium'
if (!existsSync(from)) process.exit(0)
mkdirSync('public/cesium', { recursive: true })
for (const dir of ['Workers', 'Assets', 'ThirdParty', 'Widgets']) cpSync(`${from}/${dir}`, `public/cesium/${dir}`, { recursive: true })
