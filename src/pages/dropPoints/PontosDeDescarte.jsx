import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { EmptyState, LoadingState, PageShell, StatusBadge } from '../../components/Ui.jsx';
import { materialOptions } from '../../data/demoData.js';
import { listDisposalPoints } from '../../services/biosyncService.js';
import { ROUTES } from '../../routes/appRoutes.js';

function DisposalMap({ points, selectedPoint, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [-21.6036, -48.3657],
      zoom: 8,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const icon = L.divIcon({
      className: 'biosync-map-marker',
      html: '<span></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const bounds = [];
    points
      .filter((point) => point.geo?.lat && point.geo?.lng)
      .forEach((point) => {
        const marker = L.marker([point.geo.lat, point.geo.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${point.name}</strong><br>${point.city}/${point.state}`)
          .on('click', () => onSelect(point));
        markersRef.current.push(marker);
        bounds.push([point.geo.lat, point.geo.lng]);
      });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    }
  }, [points, onSelect]);

  useEffect(() => {
    if (!selectedPoint?.geo || !mapRef.current) return;
    mapRef.current.setView([selectedPoint.geo.lat, selectedPoint.geo.lng], 14);
  }, [selectedPoint]);

  return <div ref={containerRef} aria-label="Mapa de pontos de descarte" />;
}

export default function PontosDeDescarte() {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', city: '', material: '' });

  useEffect(() => {
    let mounted = true;
    listDisposalPoints()
      .then((data) => {
        if (mounted) setPoints(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cities = useMemo(() => [...new Set(points.map((point) => point.city))].sort(), [points]);

  const filteredPoints = useMemo(() => {
    const search = filters.search.toLowerCase();
    return points.filter((point) => {
      const matchesSearch =
        !search ||
        point.name.toLowerCase().includes(search) ||
        point.address.toLowerCase().includes(search) ||
        point.city.toLowerCase().includes(search);
      const matchesCity = !filters.city || point.city === filters.city;
      const matchesMaterial = !filters.material || point.materials?.includes(filters.material);
      return matchesSearch && matchesCity && matchesMaterial;
    });
  }, [filters, points]);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  return (
    <PageShell
      title="Pontos de descarte"
      subtitle="Mapa e lista usam a mesma fonte de dados. Em producao, os documentos aprovados vem do Firestore."
      actions={
        <Link to={ROUTES.pointRegister} className="rounded-md bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800">
          Cadastrar ponto
        </Link>
      }
    >
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <label htmlFor="search" className="mb-1 block text-sm font-semibold text-slate-700">
                Buscar
              </label>
              <div className="relative">
                <input
                  id="search"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Nome, cidade ou endereco"
                  className="form-input pl-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-semibold text-slate-700">
                Cidade
              </label>
              <select id="city" value={filters.city} onChange={(event) => updateFilter('city', event.target.value)} className="form-input">
                <option value="">Todas as cidades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="material" className="mb-1 block text-sm font-semibold text-slate-700">
                Material
              </label>
              <select id="material" value={filters.material} onChange={(event) => updateFilter('material', event.target.value)} className="form-input">
                <option value="">Todos os materiais</option>
                {materialOptions.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={() => setFilters({ search: '', city: '', material: '' })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Limpar filtros
            </button>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">{filteredPoints.length} resultado(s)</p>
              {filteredPoints.length === 0 ? (
                <EmptyState title="Nenhum ponto encontrado" description="Tente remover filtros ou cadastre um novo ponto." />
              ) : (
                filteredPoints.map((point) => (
                  <button key={point.id} onClick={() => setSelectedPoint(point)} className="w-full rounded-md border border-slate-200 p-3 text-left transition hover:border-green-500 hover:bg-green-50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-950">{point.name}</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {point.city}/{point.state} - {point.neighborhood}
                        </p>
                      </div>
                      <StatusBadge status={point.status} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <DisposalMap points={filteredPoints} selectedPoint={selectedPoint} onSelect={setSelectedPoint} />
          </section>
        </div>
      )}

      {selectedPoint && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
          <article className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-md bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{selectedPoint.name}</h2>
                <p className="text-slate-600">{selectedPoint.address}</p>
              </div>
              <button onClick={() => setSelectedPoint(null)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Fechar">
                <X />
              </button>
            </div>
            <img src={selectedPoint.imageUrl || '/PontoDescarte.png'} alt="" className="mb-4 h-52 w-full rounded-md object-cover" />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-700">Cidade</dt>
                <dd>{selectedPoint.city}/{selectedPoint.state}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Horario</dt>
                <dd>{selectedPoint.openingHours}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-700">Materiais aceitos</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {selectedPoint.materials?.map((material) => (
                    <span key={material} className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      {material}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      )}
    </PageShell>
  );
}
