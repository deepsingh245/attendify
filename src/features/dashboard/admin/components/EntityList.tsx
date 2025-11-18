import React from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'

type BaseEntity = {
  id: string
  title?: string
  name?: string
  email?: string
  phone?: string
  subject?: string
  subjects?: string[]
  department?: string
  classes?: unknown[]
  classesCount?: number
  classCount?: number
  experienceYears?: number
  experience?: number
  years?: number
}

interface EntityListProps<T extends BaseEntity> {
  items: T[]
  title?: string
  basePath: string
  renderItem?: (item: T) => React.ReactNode
  emptyText?: string
}

export default function EntityList<T extends BaseEntity>({
  items,
  basePath,
  renderItem,
  emptyText = 'No records found.',
}: EntityListProps<T>) {
  const navigate = useNavigate()

  const renderCard = (item: T) => {
    const display = renderItem ? renderItem(item) : item.title ?? item.name ?? '—'
    const name =
      typeof display === 'string'
        ? display
        : item.name ?? item.title ?? 'Unnamed'

    const initials =
    name
        .split(' ')
        .map((s) => s.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'NA'

    const subject = item.subject || item.subjects?.[0] || item.department
    const classesCount =
      item.classes?.length ?? item.classesCount ?? item.classCount ?? 0
    const experience =
      item.experienceYears ?? item.experience ?? item.years ?? 0

    return (
      <Card key={item.id} className="p-3 flex flex-col justify-between">
        {/* Header */}
        <CardHeader className="flex items-center justify-between gap-3 p-3">
          <div className="flex items-center justify-start w-full gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
              {initials}
            </div>
            <div>
              <div className="font-medium">{display}</div>
              {subject && (
                <div className="mt-1">
                  <span className="inline-block text-xs bg-muted px-2 py-1 rounded-full">
                    {subject}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 pt-3">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {item.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{item.email}</span>
              </div>
            )}
            {item.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{item.phone}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-3 mt-3 flex items-center justify-between text-sm">
            <div className='flex flex-col gap-2'>
              <div className="text-xs text-muted-foreground">Classes</div>
              <div className="font-medium">{classesCount}</div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className="text-xs text-muted-foreground">Experience</div>
              <div className="font-medium">{experience} years</div>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`${basePath}/${item.id}`)}
          >
            View Profile
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">{emptyText}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(renderCard)}
        </div>
      )}
    </div>
  )
}
