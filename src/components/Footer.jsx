export default function Footer() {
  return (
    <footer className="mt-auto bg-green-700 py-8 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
          <div>
            <h2 className="text-2xl font-bold">BioSync</h2>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Plataforma para conectar doadores, catadores e pontos de descarte com dados rastreaveis.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-center text-lg font-semibold md:text-right">Idealizadores</h3>
            <div className="flex flex-wrap justify-center gap-4 md:justify-end">
            {[
              { image: "/foto1.jpg", link: "https://www.linkedin.com/in/jo%C3%A3o-tavares-19937b24b/" },
              { image: "/foto2.jpeg", link: "https://www.linkedin.com/in/edson-henrique-pereira-dsm/" },
              { image: "/foto3.png", link: "https://github.com/joseantoniojuniord" },
              { image: "/foto4.jpg", link: "https://www.linkedin.com/in/lucas-maciel-650711217/" },
              { image: "/foto5.jpg", link: "https://www.linkedin.com/in/higor-v-padilha-41aaa4236/" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28"
              >
                <img
                src={item.image}
                alt={`Imagem do idealizador ${index + 1}`}
                  className="h-16 w-16 rounded-full object-cover shadow-lg ring-2 ring-white/40 sm:h-20 sm:w-20"
                />
              </a>
            ))}
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-white/75">© Copyright 2026 | BIOSYNC</p>
      </div>
    </footer>
  );
}
