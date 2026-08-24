import { toBlob } from 'html-to-image'

export async function exportCardImage(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    width: 1080,
    height: 1080,
    pixelRatio: 1,
    cacheBust: true,
  })
  if (!blob) throw new Error('Failed to export image')
  return blob
}

export function deepLinkFor(id: string): string {
  const url = new URL(window.location.href)
  url.search = new URLSearchParams({ fact: id }).toString()
  return url.toString()
}
