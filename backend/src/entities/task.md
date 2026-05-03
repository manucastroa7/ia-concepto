# Integración de Carga de Paquetes CRM -> Web

- [x] Modificar backend de `ia-concepto`:
  - [x] Revisar si `synchronize: true` está habilitado en `data-source.ts`.
  - [x] Agregar campos `isPublished` (boolean), `webCategory` (string), `imageUrl` (string), `tags` (array), `highlights` (array) a la entidad `Circuit.ts`.
  - [x] Agregar los mismos campos a la entidad `GroupDeparture.ts`.
  - [x] Crear la entidad nueva `WebPackage.ts` con todos los campos estandarizados (para cargas manuales limpias destinadas a la web).
- [x] Implementar endpoint público:
  - [x] Crear el controlador `PublicPackageController.ts`.
  - [x] En dicho controlador, implementar lógica que recupere todos los `Circuit` y `GroupDeparture` con `isPublished: true`, y todos los `WebPackage` con `isPublished: true`.
  - [x] Formatear y unificar todas las respuestas en un array mapeado a la interfaz de `TravelPackage` usada en `concepto-web`.
  - [x] Agregar la ruta `GET /api/public/packages` al archivo `index.ts`.
- [ ] Modificar `concepto-web`:
  - [ ] Añadir constante/env var de `API_URL`.
  - [ ] Modificar `App.tsx` para usar `useEffect` y cargar los productos directamente desde el backend.
- [ ] (Opcional si hay tiempo) Modificar UI del CRM (`ia-concepto/frontend`):
  - [ ] Agregar interfaz básica para crear "Web Packages" manuales.
  - [ ] Agregar botones de publicación a Circuitos y Salidas Grupales.
