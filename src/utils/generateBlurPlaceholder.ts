export async function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const maxSize = 10
        const aspectRatio = img.height / img.width
        canvas.width = maxSize
        canvas.height = Math.round(maxSize * aspectRatio)
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.5))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}