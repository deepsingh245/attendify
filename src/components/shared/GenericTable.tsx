import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

export type Column<T> = {
  key: string
  header: React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (row: T, rowIndex: number) => React.ReactNode
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  showPagination?: boolean
  className?: string
  caption?: React.ReactNode
}

export default function GenericTable<T>({
  columns,
  data,
  pageSize = 10,
  showPagination = true,
  className,
  caption,
}: Props<T>) {
  const [page, setPage] = useState(1)

  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1))

  // reset page when data changes and current page is out of range
  React.useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  return (
    <div className={className}>
      <div className="overflow-auto rounded-md shadow-sm border">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  className={`${col.align === 'center' ? 'text-center' : ''} ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row, idx) => {
              const rowId = (row as unknown as { id?: string }).id ?? idx
              return (
                <TableRow key={rowId} className="border-t">
                  {columns.map((col) => {
                    const cellValue = (row as unknown as Record<string, unknown>)[col.key]
                    return (
                      <TableCell key={col.key} className={`${col.align === 'center' ? 'text-center' : ''} ${col.align === 'right' ? 'text-right' : ''}`}>
                        {col.render ? col.render(row, (page - 1) * pageSize + idx) : cellValue as React.ReactNode}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-3 py-6 text-center text-sm text-muted-foreground">No data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-muted-foreground">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={page === 1}>Prev</Button>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={i + 1 === page ? 'default' : 'ghost'}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={goNext} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
