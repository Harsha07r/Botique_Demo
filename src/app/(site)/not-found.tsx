import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">We could not find that page</h1>
      <p className="mt-2 text-muted">The piece may have sold out or the link has a typo.</p>
      <Link href="/shop" className="btn btn-maroon mt-6">Browse the shop</Link>
    </div>
  );
}
