export default function InsightsCallHistoryPage() {
  const calls = [
    { contact: 'Jordan Cook', duration: '16m 24s', status: 'Connected', time: 'Today, 09:14' },
    { contact: 'James Corcoran', duration: '02m 11s', status: 'No answer', time: 'Today, 08:50' },
    { contact: 'Kei Nakamura', duration: '27m 02s', status: 'Connected', time: 'Yesterday, 17:03' },
    { contact: 'Arjun Rao', duration: '11m 49s', status: 'Connected', time: 'Yesterday, 13:25' }
  ];

  return (
    <section className="panel insights-history-panel">
      <header className="insights-history-head">
        <h1>Call history</h1>
        <p>Review completed and missed calls linked to your scheduling workflows.</p>
      </header>

      <div className="insights-history-table-wrap">
        <table className="insights-history-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={`${call.contact}-${call.time}`}>
                <td>{call.contact}</td>
                <td>{call.duration}</td>
                <td>{call.status}</td>
                <td>{call.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
