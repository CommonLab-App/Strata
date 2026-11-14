import { Settings as ShellSettings } from '@commonlab/shell'
import { useAppState } from '@/app/AppState'
import { storage } from '@/app/progress/storage'

/** The shared shell's settings page, with StrataLab's state and saved data. */
export function Settings() {
  return <ShellSettings state={useAppState()} storage={storage} />
}
