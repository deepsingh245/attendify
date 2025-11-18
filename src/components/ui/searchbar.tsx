import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export const SearchBar = ({ button }: { button: boolean }) => {
  return (
    <div className="flex items-center gap-2 w-full max-w-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input type="search" placeholder="Search..." className="pl-9" />
      </div>
      {button && <Button type="submit">
        Search
      </Button>}
    </div>
  )
}
