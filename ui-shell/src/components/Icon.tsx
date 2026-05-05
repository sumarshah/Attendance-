type IconName =
  | 'bell'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'menu'
  | 'search'
  | 'x'
  | 'clock'
  | 'mapPin'
  | 'users'
  | 'bus'
  | 'shield'
  | 'arrowUpRight'

export default function Icon(props: { name: IconName; size?: number; className?: string }) {
  const size = props.size ?? 18
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: props.className,
    'aria-hidden': true,
  } as const

  const stroke = 'currentColor'
  const s = 1.9
  const cap = 'round' as const
  const join = 'round' as const

  switch (props.name) {
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke={stroke}
            strokeWidth={s}
          />
          <path d="M16.3 16.3 21 21" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
            stroke={stroke}
            strokeWidth={s}
            strokeLinejoin={join}
          />
          <path d="M10 19a2 2 0 0 0 4 0" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'chevronDown':
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" stroke={stroke} strokeWidth={s} strokeLinecap={cap} strokeLinejoin={join} />
        </svg>
      )
    case 'chevronLeft':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" stroke={stroke} strokeWidth={s} strokeLinecap={cap} strokeLinejoin={join} />
        </svg>
      )
    case 'chevronRight':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" stroke={stroke} strokeWidth={s} strokeLinecap={cap} strokeLinejoin={join} />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <path
            d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
            stroke={stroke}
            strokeWidth={s}
          />
          <path d="M12 6v6l4 2" stroke={stroke} strokeWidth={s} strokeLinecap={cap} strokeLinejoin={join} />
        </svg>
      )
    case 'mapPin':
      return (
        <svg {...common}>
          <path
            d="M12 22s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
            stroke={stroke}
            strokeWidth={s}
            strokeLinejoin={join}
          />
          <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke={stroke} strokeWidth={s} />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <path
            d="M17 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"
            stroke={stroke}
            strokeWidth={s}
            strokeLinejoin={join}
          />
          <path d="M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke={stroke} strokeWidth={s} />
          <path d="M21 21v-1a3.2 3.2 0 0 0-2.5-3.1" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
          <path d="M16.5 3.2a4 4 0 0 1 0 7.6" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'bus':
      return (
        <svg {...common}>
          <path
            d="M6 17h12M7 4h10a3 3 0 0 1 3 3v10H4V7a3 3 0 0 1 3-3Z"
            stroke={stroke}
            strokeWidth={s}
            strokeLinejoin={join}
          />
          <path d="M7 17v2M17 17v2" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
          <path d="M7 8h10" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
          <path d="M8 13h.01M16 13h.01" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path
            d="M12 2 20 6v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
            stroke={stroke}
            strokeWidth={s}
            strokeLinejoin={join}
          />
          <path d="M9.5 12l1.8 1.8L15.8 9" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
        </svg>
      )
    case 'arrowUpRight':
      return (
        <svg {...common}>
          <path d="M7 17 17 7" stroke={stroke} strokeWidth={s} strokeLinecap={cap} />
          <path d="M10 7h7v7" stroke={stroke} strokeWidth={s} strokeLinecap={cap} strokeLinejoin={join} />
        </svg>
      )
    default:
      return null
  }
}

