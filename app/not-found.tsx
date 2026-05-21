import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-linen px-6 text-center text-forest">
      <div>
        <p className="font-serif text-7xl">404</p>
        <h1 className="mt-4 text-2xl font-bold">This path has drifted off trail.</h1>
        <Link className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 font-bold text-linen" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
