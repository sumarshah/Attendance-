import Icon from './Icon'

export type PunchStreamItem = {
  id: string
  punchType: 'IN' | 'OUT'
  punchedAt: string
  deviceId: string | null
  employee: { fullName: string }
  project: { projectName: string }
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function PunchStream({ items }: { items: PunchStreamItem[] }) {
  return (
    <div className="punchFeed" role="region" aria-label="Live Punch Monitor">
      <div className="punchHead">
        <div className="punchCol punchColTime">Time</div>
        <div className="punchCol punchColEmp">Employee</div>
        <div className="punchCol punchColProject">Project</div>
        <div className="punchCol punchColPunch">Punch</div>
        <div className="punchCol punchColSource">Source</div>
      </div>

      <div className="punchBody">
        {items.length === 0 ? (
          <div className="punchEmpty">
            <Icon name="clock" /> No punches yet
          </div>
        ) : (
          items.map((p) => {
            const tone = p.punchType === 'IN' ? 'in' : 'out'
            return (
              <div key={p.id} className={`punchRow ${tone}`}>
                <div className="punchCol punchColTime mono">{fmtTime(p.punchedAt)}</div>
                <div className="punchCol punchColEmp">{p.employee.fullName}</div>
                <div className="punchCol punchColProject">{p.project.projectName}</div>
                <div className="punchCol punchColPunch">
                  <span className={`pill pillPunch ${tone}`}>{p.punchType}</span>
                </div>
                <div className="punchCol punchColSource mono">{p.deviceId ?? '-'}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
