export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
        <p>
          © {new Date().getFullYear()} BiMetal. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
