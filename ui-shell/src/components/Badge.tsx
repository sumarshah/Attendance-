export default function Badge(props: { children: string; tone?: 'good' | 'warn' | 'bad' | 'info' }) {
  const tone = props.tone ?? 'info'
  return <span className={`badge tone-${tone}`}>{props.children}</span>
}

