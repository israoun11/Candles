import { Link } from 'react-router-dom';
// Shown for routes whose stage is not built yet. Removed as each page ships.
export default function Pending() {
  return (
    <section className="intro" style={{ minHeight: '70svh', alignContent: 'center' }}>
      <h2>This page is built in the next stage.</h2>
      <Link className="btn" to="/">Back to home</Link>
    </section>
  );
}
