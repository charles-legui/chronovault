import { ref, computed } from 'vue'

// ── Types ──────────────────────────────────────────────────
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface UploadFile {
  id:         string
  file:       File
  previewUrl: string | null   // object URL for images
  status:     UploadStatus
  progress:   number          // 0–100
  error?:     string
}

// ── Helpers ───────────────────────────────────────────────
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'])

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function isImage(file: File) {
  return file.type.startsWith('image/')
}

function makePreview(file: File): Promise<string | null> {
  if (!isImage(file)) return Promise.resolve(null)
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string ?? null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

// ── Composable ────────────────────────────────────────────
export function useUploadQueue() {
  const queue   = ref<UploadFile[]>([])
  const timers  = new Map<string, ReturnType<typeof setInterval>>()

  // ── Computed ─────────────────────────────────────────────
  const pending   = computed(() => queue.value.filter(f => f.status === 'pending').length)
  const uploading = computed(() => queue.value.filter(f => f.status === 'uploading').length)
  const succeeded = computed(() => queue.value.filter(f => f.status === 'success').length)
  const failed    = computed(() => queue.value.filter(f => f.status === 'error').length)
  const total     = computed(() => queue.value.length)
  const allDone   = computed(() => total.value > 0 && pending.value === 0 && uploading.value === 0)

  const overallProgress = computed(() => {
    if (!total.value) return 0
    return Math.round(queue.value.reduce((sum, f) => sum + f.progress, 0) / total.value)
  })

  // ── Add files ────────────────────────────────────────────
  async function addFiles(files: File[]) {
    const accepted = files.filter(f => ACCEPTED.has(f.type))

    const entries = await Promise.all(
      accepted.map(async (file, localIndex) => {
        const previewUrl = await makePreview(file)
        const entry: UploadFile = {
          id: uid(),
          file,
          previewUrl,
          status: 'pending',
          progress: 0,
        }
        return { entry, localIndex }
      }),
    )

    entries.forEach(({ entry, localIndex }) => {
      queue.value.push(entry)
      // Stagger start for visual effect
      const delay = localIndex * 120 + 200
      setTimeout(() => startUpload(entry.id, localIndex), delay)
    })

    return accepted.length
  }

  // ── Simulate upload ───────────────────────────────────────
  function startUpload(id: string, queueIndex: number) {
    const item = queue.value.find(f => f.id === id)
    if (!item) return

    item.status = 'uploading'

    // Deterministic: every 5th file (index 4, 9, …) gets an error
    const willFail = (queue.value.indexOf(item)) % 5 === 4

    const interval = setInterval(() => {
      const f = queue.value.find(i => i.id === id)
      if (!f) { clearInterval(interval); return }

      // Random increment: 4–14% per tick (150ms)
      const increment = 4 + Math.random() * 10
      // Slow down near the end for realism
      const slowFactor = f.progress > 80 ? 0.35 : f.progress > 60 ? 0.65 : 1
      f.progress = Math.min(100, f.progress + increment * slowFactor)

      if (f.progress >= 100) {
        f.progress = 100
        clearInterval(interval)
        timers.delete(id)

        setTimeout(() => {
          const target = queue.value.find(i => i.id === id)
          if (!target) return
          if (willFail) {
            target.status = 'error'
            target.error  = 'Fichier rejeté — format non supporté par le serveur.'
          } else {
            target.status = 'success'
          }
        }, 250)
      }
    }, 150)

    timers.set(id, interval)
  }

  // ── Remove ────────────────────────────────────────────────
  function remove(id: string) {
    const timer = timers.get(id)
    if (timer) { clearInterval(timer); timers.delete(id) }
    queue.value = queue.value.filter(f => f.id !== id)
  }

  // ── Retry ────────────────────────────────────────────────
  function retry(id: string) {
    const item = queue.value.find(f => f.id === id)
    if (!item) return
    item.progress = 0
    item.status   = 'pending'
    item.error    = undefined
    setTimeout(() => startUpload(id, queue.value.indexOf(item)), 200)
  }

  // ── Clear completed ───────────────────────────────────────
  function clearDone() {
    queue.value = queue.value.filter(f => f.status !== 'success')
  }

  // ── Clear all ─────────────────────────────────────────────
  function clearAll() {
    timers.forEach(t => clearInterval(t))
    timers.clear()
    queue.value = []
  }

  return {
    queue, pending, uploading, succeeded, failed, total, allDone, overallProgress,
    addFiles, remove, retry, clearDone, clearAll,
    ACCEPTED,
  }
}
