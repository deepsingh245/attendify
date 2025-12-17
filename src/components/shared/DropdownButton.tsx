import React from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

export interface DropdownOption {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'secondary'
}

interface DropdownButtonProps {
  options: DropdownOption[]
  triggerLabel?: string
  triggerIcon?: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

/**
 * Generic dropdown button component
 * @param options - Array of dropdown options with label, icon, and onClick handler
 * @param triggerLabel - Optional label for the trigger button
 * @param triggerIcon - Optional custom icon for the trigger button
 * @param align - Alignment of dropdown menu
 * @param side - Side of dropdown menu
 * @param className - Optional CSS class for styling
 */
const DropdownButton: React.FC<DropdownButtonProps> = ({
  options,
  triggerLabel,
  triggerIcon,
  align = 'end',
  side = 'bottom',
  className = '',
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          aria-label={triggerLabel || 'More Options'}
          className={className}
        >
          {triggerIcon || <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-52">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={option.onClick}
              className={`cursor-pointer ${
                option.variant === 'destructive' ? 'text-red-600' : ''
              }`}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownButton
