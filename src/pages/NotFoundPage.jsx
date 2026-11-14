import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="page not-found">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link className="btn btn-primary" to="/">
        Back to home
      </Link>
    </section>
  );
}
