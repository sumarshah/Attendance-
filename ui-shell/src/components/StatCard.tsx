import Icon from './Icon'
import { Link } from 'react-router-dom'

export default function StatCard(props: {
  title: string
  value: string
  delta?: string
  icon: Parameters<typeof Icon>[0]['name']
  tone?: 'blue' | 'maroon' | 'neutral'
  to?: string
}) {
  const tone = props.tone ?? 'neutral'
  const inner = (
    <>
      <div className="statTop">
        <div className="statIcon" aria-hidden="true">
          <Icon name={props.icon} />
        </div>
        {props.delta ? <div className="statDelta">{props.delta}</div> : <div className="statDelta muted"> </div>}
      </div>
      <div className="statValue">{props.value}</div>
      <div className="statTitle">{props.title}</div>
    </>
  )

  return props.to ? (
    <Link className={`statCard tone-${tone} isLink`} to={props.to}>
      {inner}
    </Link>
  ) : (
    <div className={`statCard tone-${tone}`}>{inner}</div>
  )
}
