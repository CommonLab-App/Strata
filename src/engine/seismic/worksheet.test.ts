import { describe, expect, it } from 'vitest'
import event from '@data/seismograms/us7000pcdl.json'
import { distanceKm } from '../geo'
import { locateEpicentre } from './locate'
import { TRAVEL_TIME_TABLE } from './travelTime'
import { EMPTY_EPICENTRE, scoreEpicentre, stationDistances, type StationForLab } from './worksheet'

const stations: StationForLab[] = event.stations.map((s) => ({ key: `${s.net}.${s.sta}`, lat: s.lat, lon: s.lon, refP: s.refP, refS: s.refS }))
const catalogue = { lat: event.event.lat, lon: event.event.lon }
const refPicks = Object.fromEntries(stations.map((s) => [s.key, { p: s.refP, s: s.refS }]))

describe('scoreEpicentre on a bundled event', () => {
  it('gives full marks to the reference picks and the point they imply, which lands near the catalogue epicentre', () => {
    const ws = { ...EMPTY_EPICENTRE(event.event.id), picks: refPicks }
    const distances = stationDistances(ws, stations, TRAVEL_TIME_TABLE)
    const expected = locateEpicentre(stations.map((s, i) => ({ lat: s.lat, lon: s.lon, km: distances[i]!.km })))
    const result = scoreEpicentre({ ...ws, epicentre: expected }, stations, catalogue, TRAVEL_TIME_TABLE)
    expect(result?.score).toBe(2)
    // The model's picks were made at the catalogue distances, so the inversion should come back close.
    expect(distanceKm(expected, catalogue)).toBeLessThan(60)
  })
  it('is null until every pick and the point exist, and loses marks for picks far off', () => {
    expect(scoreEpicentre(EMPTY_EPICENTRE(event.event.id), stations, catalogue, TRAVEL_TIME_TABLE)).toBeNull()
    const off = Object.fromEntries(stations.map((s) => [s.key, { p: s.refP + 10, s: s.refS + 10 }]))
    const result = scoreEpicentre({ ...EMPTY_EPICENTRE(event.event.id), picks: off, epicentre: catalogue }, stations, catalogue, TRAVEL_TIME_TABLE)
    expect(result?.picksOk).toBe(false)
  })
})
