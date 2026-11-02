import { describe, expect, it } from 'vitest'
import { canTransitionAppointment } from '../../utils/appointmentTransitions'

describe('appointment lifecycle transitions', () => {
  it('allows starting only after check-in', () => {
    expect(canTransitionAppointment('checked_in', 'in_progress')).toBe(true)
    expect(canTransitionAppointment('confirmed', 'in_progress')).toBe(false)
  })

  it('allows completion from the backend-supported active states', () => {
    expect(canTransitionAppointment('confirmed', 'completed')).toBe(true)
    expect(canTransitionAppointment('checked_in', 'completed')).toBe(true)
    expect(canTransitionAppointment('in_progress', 'completed')).toBe(true)
    expect(canTransitionAppointment('cancelled', 'completed')).toBe(false)
  })

  it('allows no-show only for confirmed appointments', () => {
    expect(canTransitionAppointment('confirmed', 'no_show')).toBe(true)
    expect(canTransitionAppointment('checked_in', 'no_show')).toBe(false)
  })
})
