import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useBackNavigation() {
  const navigate = useNavigate()

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/feed')
    }
  }, [navigate])

  return goBack
}