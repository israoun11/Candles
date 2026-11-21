import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="pg">
      <h1 className="pg-title">Page not found</h1>
      <p className="lead">That page doesn’t exist.</p>
      <Link className="btn" to="/collections">See the collections</Link>
    </div>
  );
}
