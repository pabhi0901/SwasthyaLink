import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'

const REELS = [
  {
    src: 'https://ik.imagekit.io/g6obyrspb/Hosptl/Health_Tech_Ad_Generation.mp4?updatedAt=1772286293925',
    title: 'Architectural Excellence',
    subtitle: 'Designed for healing, our facilities combine modern medical precision with luxury aesthetic comfort.',
  },
  {
    src: 'https://ik.imagekit.io/g6obyrspb/Hosptl/Health_Tech_Ad_Generation%20(2).mp4',
    title: 'Cutting-edge Diagnostics',
    subtitle: "Equipped with the world's most advanced imaging and laboratory technologies.",
  },
  {
    src: 'https://ik.imagekit.io/g6obyrspb/Hosptl/Healthcare_Video_Generation_Request.mp4',
    title: 'Expert Medical Team',
    subtitle: 'Our specialists bring decades of excellence to every consultation and procedure.',
  },
  {
    src: 'https://ik.imagekit.io/g6obyrspb/Hosptl/Healthcare_Video_Prompt_and_Generation.mp4',
    title: 'Patient-First Care',
    subtitle: 'Every treatment plan is personally crafted to optimize your unique health outcomes.',
  },
  {
    src: 'https://ik.imagekit.io/g6obyrspb/Hosptl/SwasthyaLink_Promotional_Video_Creation.mp4',
    title: 'SwasthyaLink Experience',
    subtitle: 'Where modern healthcare meets compassionate service for complete wellness.',
  },
]

const GAP = 20 // px gap between cards

const VideoCard = ({ reel, muted, onToggleMute, cardWidth }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  return (
    <div
      className="relative rounded-2xl overflow-hidden shrink-0 bg-gray-900 group"
      style={{ width: cardWidth, height: 340 }}
    >
      <video
        ref={videoRef}
        src={reel.src}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

      {/* Caption bottom-left */}
      <div className="absolute bottom-5 left-5 right-14 text-white">
        <h3
          className="text-lg font-semibold leading-tight mb-1"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#a8c4e0' }}
        >
          {reel.title}
        </h3>
        <p className="text-xs text-white/80 leading-snug line-clamp-2">{reel.subtitle}</p>
      </div>

      {/* Mute / Unmute — bottom right */}
      <button
        onClick={onToggleMute}
        className="absolute bottom-5 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors text-white backdrop-blur-sm"
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-4.243-4.243M12 18l4.243-4.243M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  )
}

const VideoReelSection = () => {
  const [startIndex, setStartIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [mutedMap, setMutedMap] = useState(() =>
    Object.fromEntries(REELS.map((_, i) => [i, true]))
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const viewportRef = useRef(null)

  // Measure viewport width and re-measure on resize
  useLayoutEffect(() => {
    const measure = () => {
      if (viewportRef.current) setContainerWidth(viewportRef.current.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (viewportRef.current) ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [])

  const total = REELS.length
  const cardWidth = containerWidth > 0 ? (containerWidth - GAP) / 2 : 0
  const stepPx = cardWidth + GAP
  const trackOffset = startIndex * stepPx

  const goTo = (newIndex) => {
    if (animating) return
    setAnimating(true)
    setStartIndex(newIndex)
    setTimeout(() => setAnimating(false), 550)
  }

  const prev = () => goTo((startIndex - 1 + total) % total)
  const next = () => goTo((startIndex + 1) % total)
  const toggleMute = (idx) => setMutedMap((m) => ({ ...m, [idx]: !m[idx] }))

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p
              className="text-xs font-semibold uppercase mb-3"
              style={{ letterSpacing: '0.15em', color: '#c8a96e' }}
            >
              The Facility
            </p>
            <h2
              className="text-4xl md:text-5xl text-gray-900"
              style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 400 }}
            >
              Inside SwasthyaLink
            </h2>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={prev}
              disabled={animating}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={animating}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewport — clips the sliding track */}
        <div ref={viewportRef} className="overflow-hidden rounded-2xl">
          {/* Track — all 5 cards in one row, animated via translateX */}
          <div
            style={{
              display: 'flex',
              gap: GAP,
              transform: `translateX(-${trackOffset}px)`,
              transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
            }}
          >
            {REELS.map((reel, i) => (
              <VideoCard
                key={i}
                reel={reel}
                muted={mutedMap[i]}
                onToggleMute={() => toggleMute(i)}
                cardWidth={cardWidth}
              />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {REELS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === startIndex ? 'w-6 bg-gray-700' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to reel ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

export default VideoReelSection