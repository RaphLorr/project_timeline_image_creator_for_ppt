interface MaterialIconProps {
  readonly name: string
  readonly className?: string
  readonly size?: number
}

export function MaterialIcon({ name, className = '', size = 20 }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}
