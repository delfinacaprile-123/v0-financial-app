interface PageHeaderProps {
  title: string
  description?: string
  color?: string
}

export function PageHeader({ title, description, color = '#C9A96E' }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h1 className="font-serif text-3xl text-[#E8E8E8]">{title}</h1>
      </div>
      {description && (
        <p className="text-[#888888] text-sm ml-5">{description}</p>
      )}
    </div>
  )
}
