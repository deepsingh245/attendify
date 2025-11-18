import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

type TicketType = {
  id: string
  title: string
  from: string
  fromEmail?: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  description?: string
  createdAt?: string
}

type Props = {
  ticket: TicketType
  onClose: () => void
  onUpdate: (t: TicketType) => void
}

const priorityColor = (p: TicketType['priority']) =>
  p === 'High' ? 'bg-red-100 text-red-800' : p === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'

const statusColor = (s: TicketType['status']) =>
  s === 'Open' ? 'bg-blue-100 text-blue-800' : s === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'

const Ticket = ({ ticket, onClose, onUpdate }: Props) => {
  const changeStatus = (status: TicketType['status']) => {
    const updated = { ...ticket, status }
    // TODO: persist to Firebase / backend here
    onUpdate(updated)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            {ticket.fromEmail ? (
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.from)}&background=0D8ABC&color=fff`} />
            ) : (
              <AvatarFallback>{ticket.from?.[0] ?? 'U'}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <CardTitle>{ticket.title}</CardTitle>
            <div className="text-sm text-muted-foreground">{ticket.from} • {ticket.fromEmail}</div>
          </div>

          <div className="text-right">
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</div>
            <div className="mt-2 text-xs text-muted-foreground">{ticket.createdAt ? format(new Date(ticket.createdAt), 'dd MMM yyyy') : ''}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose max-w-none">
          <p>{ticket.description}</p>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-2">
          {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <Button variant="secondary" size="sm" onClick={() => changeStatus('In Progress')}>Mark In Progress</Button>
          )}

          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
            <Button variant="default" size="sm" onClick={() => changeStatus('Resolved')}>Resolve</Button>
          )}

          {ticket.status !== 'Closed' && (
            <Button variant="outline" size="sm" onClick={() => changeStatus('Closed')}>Close</Button>
          )}
        </div>

        <div className="ml-auto">
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor(ticket.status)}`}>{ticket.status}</div>
          <Button variant="link" size="sm" onClick={onClose} className="ml-3">Back to list</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default Ticket