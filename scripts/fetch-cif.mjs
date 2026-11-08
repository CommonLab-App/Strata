// Fetches one crystal structure from the Crystallography Open Database into data/cif/ and records its provenance.
//   node scripts/fetch-cif.mjs <mineral-id> <search name> [--cod <id>]
// The search asks COD for entries whose mineral name matches; --cod picks an entry by id instead. Public-domain data.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const [mineral, name, ...rest] = process.argv.slice(2)
if (!mineral || !name) {
  console.error('usage: fetch-cif.mjs <mineral-id> <search name> [--cod <id>]')
  process.exit(1)
}
const codArg = rest.indexOf('--cod') >= 0 ? rest[rest.indexOf('--cod') + 1] : null

let entry
if (codArg) {
  entry = { file: codArg }
} else {
  const res = await fetch(`https://www.crystallography.net/cod/result?text=${encodeURIComponent(name)}&format=json`)
  if (!res.ok) throw new Error(`COD search ${res.status}`)
  const rows = await res.json()
  const lower = name.toLowerCase()
  const byMineral = rows.filter((r) => (r.mineral ?? '').toLowerCase() === lower)
  // Prefer a plain entry at room conditions with few elements: a teaching structure, not an exotic substitution.
  entry = { candidates: (byMineral.length ? byMineral : rows).sort((a, b) => Number(a.nel ?? 99) - Number(b.nel ?? 99) || Number(a.file) - Number(b.file)) }
  if (!entry.candidates.length) throw new Error(`COD found nothing for ${name}`)
}
/** True when the atom-site loop has at least one row with a numeric fractional coordinate (some entries hold only "?"). */
function hasAtomRows(text) {
  const at = text.indexOf('_atom_site_fract_x')
  if (at < 0) return false
  const after = text.slice(at).split('\n').slice(1)
  const firstRow = after.find((line) => line.trim() && !line.trim().startsWith('_'))
  return firstRow !== undefined && /(^|\s)-?\d/.test(firstRow)
}

// The first candidate that is a full structure: some COD entries hold a cell without atoms, or no cell at all.
let url, cif
for (const candidate of entry.candidates ?? [entry]) {
  url = `https://www.crystallography.net/cod/${candidate.file}.cif`
  cif = await (await fetch(url)).text()
  if (cif.includes('_cell_length_a') && hasAtomRows(cif)) {
    entry = candidate
    break
  }
  cif = null
}
if (!cif) throw new Error(`no COD entry for ${name} has a cell and atom sites`)
const formula = (cif.match(/_chemical_formula_sum\s+'([^']+)'/) ?? [])[1] ?? entry.formula ?? null
const mineralName = (cif.match(/_chemical_name_mineral\s+'?([^'\n]+)'?/) ?? [])[1]?.trim() ?? entry.mineral ?? null
const spaceGroup = (cif.match(/_symmetry_space_group_name_H-M\s+'?([^'\n]+)'?/) ?? cif.match(/_space_group_name_H-M_alt\s+'?([^'\n]+)'?/) ?? [])[1]?.trim() ?? entry.sg ?? null

writeFileSync(`data/cif/${mineral}.cif`, cif)
const indexPath = 'data/cif/index.json'
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : {}
index[mineral] = { cod: String(entry.file), url, mineral: mineralName, formula, spaceGroup, fetched: new Date().toISOString().slice(0, 10) }
writeFileSync(indexPath, JSON.stringify(Object.fromEntries(Object.entries(index).sort()), null, 2) + '\n')
console.log(`${mineral.padEnd(12)} COD ${String(entry.file).padEnd(8)} ${String(mineralName).padEnd(18)} ${String(formula).padEnd(24)} ${spaceGroup}`)
