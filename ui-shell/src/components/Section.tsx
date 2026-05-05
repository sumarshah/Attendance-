export default function Section(props: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="sectionHeader">
        <h2 className="h2">{props.title}</h2>
        <div className="sectionRight">{props.right}</div>
      </div>
      <div className="sectionBody">{props.children}</div>
    </section>
  )
}

