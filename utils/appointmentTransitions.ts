export type AppointmentStatus = 'held' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'no_show'

export function canTransitionAppointment(status: AppointmentStatus, next: 'in_progress' | 'completed' | 'no_show') {
  if (next === 'in_progress') return status === 'checked_in'
  if (next === 'no_show') return status === 'confirmed'
  return ['confirmed', 'checked_in', 'in_progress'].includes(status)
}
