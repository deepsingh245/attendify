import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Ticket from './Ticket'
import sampleTickets, { TicketType } from './ticketsData'

const TicketRoute = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<TicketType | null>(null)

  useEffect(() => {
    if (!id) return
    // In future: fetch from Firebase by id
    const found = sampleTickets.find((t) => t.id === id)
    if (found) setTicket(found)
  }, [id])

  const onUpdate = (updated: TicketType) => {
    // TODO: persist update to backend (Firebase)
    setTicket(updated)
  }

  if (!ticket) return <div className="p-4">Ticket not found</div>

  return <div className="p-4"><Ticket ticket={ticket} onClose={() => navigate('/admin/tickets')} onUpdate={onUpdate} /></div>
}

export default TicketRoute
