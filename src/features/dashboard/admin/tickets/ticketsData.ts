import { teachersData } from '@/features/dashboard/teacher/teachersData'

export type TicketType = {
  id: string
  title: string
  from: string
  fromEmail?: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  description?: string
  createdAt?: string
}

const studentPool = teachersData.students || []

const priorities: TicketType['priority'][] = ['Low', 'Medium', 'High']
const statuses: TicketType['status'][] = ['Open', 'In Progress', 'Resolved', 'Closed']

function pick<T>(arr: T[], i: number) {
  if (arr.length === 0) return undefined as unknown as T
  return arr[i % arr.length]
}

export const sampleTickets: TicketType[] = Array.from({ length: 10 }).map((_, i) => {
  const student = pick(studentPool, i) || { name: `student${i + 1}`, email: `student${i + 1}@example.com`, id: `S${100 + i}` }
  return {
    id: `ticket-${i + 1}`,
    title: [
      'Unable to mark attendance',
      'Face recognition failing',
      'Export CSV missing columns',
      'Mobile UI overlap',
      'Student profile photo not loading',
      'Slow load on dashboard',
      'Attendance mismatch for class',
      'Error while uploading model files',
      'Notifications not delivered',
      'Permission denied on reports',
    ][i],
    from: (student as any).name ?? (student as any).userName ?? 'unknown',
    fromEmail: (student as any).email ?? `${(student as any).userName ?? 'user'}@example.com`,
    priority: pick(priorities, i % priorities.length) as TicketType['priority'],
    status: pick(statuses, i % statuses.length) as TicketType['status'],
    description: [
      'When trying to mark attendance for CS101 the system throws a 500 error.',
      'Newly enrolled students are not being recognized by the face recognition model.',
      'Exported attendance CSV does not include the notes column.',
      'Sidebar overlaps content on narrow screens on mobile devices.',
      'Profile pictures stored in storage return 403.',
      'Dashboard charts take more than 10s to render for large schools.',
      'Some students show present when they were absent.',
      'Uploading model shards fails intermittently with network error.',
      'Push notifications not delivered to android devices.',
      'Admins cannot access reports page due to permission error.',
    ][i],
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  }
})

export default sampleTickets
