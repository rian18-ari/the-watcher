import { useEffect, useRef } from 'react'
import { usePortStore } from './usePortStore'

const DWELL_MS = 90
const GRACE_CLOSE_MS = 240
const PANEL_WIDTH = 400

export function useEdgeHover() {
  const isOpen = usePortStore((s) => s.isOpen)
  const setIsOpen = usePortStore((s) => s.setIsOpen)

  const dwellTimerRef = useRef<number | null>(null)
  const graceTimerRef = useRef<number | null>(null)
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  useEffect(() => {
    if (!window.edgemon) return

    const unsubCursor = window.edgemon.onCursorEdge((edge) => {
      // 1. Opening logic: cursor hits the very edge
      if (edge.near) {
        if (!isOpenRef.current && dwellTimerRef.current === null) {
          dwellTimerRef.current = window.setTimeout(() => {
            setIsOpen(true)
            dwellTimerRef.current = null
          }, DWELL_MS)
        }
        // Cancel any pending close timer
        if (graceTimerRef.current !== null) {
          window.clearTimeout(graceTimerRef.current)
          graceTimerRef.current = null
        }
      } else {
        // Cursor left the trigger strip
        if (dwellTimerRef.current !== null) {
          window.clearTimeout(dwellTimerRef.current)
          dwellTimerRef.current = null
        }

        // 2. Closing logic: cursor is beyond the panel width
        if (isOpenRef.current) {
          if (edge.x > PANEL_WIDTH + 25 || edge.x < 0) {
            if (graceTimerRef.current === null) {
              graceTimerRef.current = window.setTimeout(() => {
                setIsOpen(false)
                graceTimerRef.current = null
              }, GRACE_CLOSE_MS)
            }
          } else {
            // Cursor is safely inside shelf
            if (graceTimerRef.current !== null) {
              window.clearTimeout(graceTimerRef.current)
              graceTimerRef.current = null
            }
          }
        }
      }
    })

    return () => {
      unsubCursor()
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current)
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current)
    }
  }, [setIsOpen])

  const handlePanelMouseEnter = () => {
    if (graceTimerRef.current !== null) {
      window.clearTimeout(graceTimerRef.current)
      graceTimerRef.current = null
    }
  }

  const handlePanelMouseLeave = () => {
    if (isOpenRef.current && graceTimerRef.current === null) {
      graceTimerRef.current = window.setTimeout(() => {
        setIsOpen(false)
        graceTimerRef.current = null
      }, GRACE_CLOSE_MS)
    }
  }

  return { handlePanelMouseEnter, handlePanelMouseLeave }
}
