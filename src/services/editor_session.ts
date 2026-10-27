// Focus events never replace an active edit session, including after native dialogs.
export function shouldAutoHydrate(enabled: boolean, hasImage: boolean, busy: boolean): boolean {
  return enabled && !hasImage && !busy;
}
export function hasUnsavedAnnotations(annotations: unknown[], saved: string): boolean {
  return JSON.stringify(annotations) !== saved;
}
