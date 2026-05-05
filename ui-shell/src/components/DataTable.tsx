import Badge from './Badge'

export type PunchRow = {
  time: string
  employee: string
  project: string
  punch: 'IN' | 'OUT'
  source: string
  status: 'OK' | 'GEOFENCE' | 'DUPLICATE'
}

const statusTone = (s: PunchRow['status']) => {
  if (s === 'OK') return 'good'
  if (s === 'GEOFENCE') return 'warn'
  return 'bad'
}

export default function DataTable(props: { rows: PunchRow[] }) {
  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Employee</th>
            <th>Project</th>
            <th>Punch</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((r, idx) => (
            <tr key={idx}>
              <td className="mono">{r.time}</td>
              <td>{r.employee}</td>
              <td>{r.project}</td>
              <td>
                <span className={`pill pillPunch ${r.punch === 'IN' ? 'isIn' : 'isOut'}`}>{r.punch}</span>
              </td>
              <td className="muted">{r.source}</td>
              <td>
                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

