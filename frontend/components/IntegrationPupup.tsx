import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface IntegrationPopupProps {
  integration: {
    name: string
    category: string
    description: string
    icon: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function IntegrationPopup({ integration, isOpen, onClose }: IntegrationPopupProps) {
  if (!integration) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              src={integration.icon}
              alt={integration.name}
              width={24}
              height={24}
              className="rounded-sm"
            />
            {integration.name}
          </DialogTitle>
          <DialogDescription>{integration.category}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>{integration.description}</p>
          <p className="mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
