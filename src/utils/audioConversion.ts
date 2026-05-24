export async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext()
  const arrayBuffer = await webmBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineContext.destination)
  source.start()

  const renderedBuffer = await offlineContext.startRendering()

  const mp3Blob = audioBufferToMp3(renderedBuffer)
  await audioContext.close()
  return mp3Blob
}

function audioBufferToMp3(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const samples = audioBuffer.length

  const mp3Data: number[] = []

  const sampleRateHex = sampleRate.toString(16)
  const channelsHex = numChannels.toString(16)
  const samplesHex = samples.toString(16)

  mp3Data.push(0xFF, 0xFB, 0x90, 0x00)
  const frameSize = 144 * 128 * 1000 / sampleRate
  const numFrames = Math.ceil(samples / 1152)

  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * 1152
    const remaining = samples - offset
    const frameSamples = Math.min(1152, remaining)

    const header = 0xFFFB9000 | ((frameSize >> 8) & 0xFF)
    mp3Data.push((header >> 24) & 0xFF, (header >> 16) & 0xFF, (header >> 8) & 0xFF, header & 0xFF)

    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch)
      for (let i = 0; i < frameSamples; i++) {
        const sample = channelData[offset + i]
        const intSample = Math.max(-1, Math.min(1, sample))
        mp3Data.push(Math.round((intSample + 1) * 127.5) & 0xFF)
      }
    }
  }

  return new Blob([new Uint8Array(mp3Data)], { type: 'audio/mp3' })
}