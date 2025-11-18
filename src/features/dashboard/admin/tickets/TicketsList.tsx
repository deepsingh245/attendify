import React, { useState } from 'react'
import Ticket from './Ticket'
import GenericTable from '@/components/shared/GenericTable'
import { useNavigate } from 'react-router-dom'
import sampleTickets, { TicketType } from './ticketsData'

const TicketsList = () => {
  const [tickets, setTickets] = useState<TicketType[]>(sampleTickets)
  const [selected, setSelected] = useState<TicketType | null>(null)

  const updateTicket = (updated: TicketType) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelected(updated)
  }

  const navigate = useNavigate()

  const columns = [
    { key: 'sno', header: 'S.No', width: '60px', render: (_: TicketType, idx: number) => idx + 1 },
    { key: 'title', header: 'Title', render: (row: TicketType) => row.title },
    { key: 'from', header: 'From', render: (row: TicketType) => row.from },
    {
      key: 'priority',
      header: 'Priority',
      render: (row: TicketType) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          row.priority === 'High' ? 'bg-red-100 text-red-800' : row.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>{row.priority}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row: TicketType) => (
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => navigate(`/admin/tickets/${row.id}`)}
        >
          View
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: TicketType) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          row.status === 'Open' ? 'bg-blue-100 text-blue-800' : row.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>{row.status}</span>
      ),
    },
  ]

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Tickets</h2>
      <GenericTable columns={columns} data={tickets} pageSize={10} />

      {selected && (
        <div className="mt-6">
          <Ticket ticket={selected} onClose={() => setSelected(null)} onUpdate={updateTicket} />
        </div>
      )}
    </div>
  )
}

export default TicketsList