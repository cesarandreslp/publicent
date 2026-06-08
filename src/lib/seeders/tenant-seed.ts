/**
 * tenant-seed.ts — Aprovisionamiento de datos iniciales de un tenant (cliente)
 *
 * Separa lo GENÉRICO de plataforma (roles, taxonomía de transparencia Res. 1519/2020,
 * menú base, categorías de noticias, festivos colombianos) de lo ESPECÍFICO del cliente
 * (usuario administrador y configuración del sitio), que llega por parámetros.
 *
 * NO contiene datos de ninguna entidad concreta: la identidad del cliente se pasa en
 * `SeedTenantParams`. Reutilizable por:
 *   - el CLI `prisma/seed.ts` (lee parámetros del entorno)
 *   - el futuro aprovisionamiento automático desde el superadmin de OSS Innovation
 *
 * Idempotente: usa upsert por clave única.
 */

import { hash } from 'bcryptjs'

export interface SeedTenantParams {
  entidad: {
    nombre: string          // razón social completa
    nombreCorto: string
    nit: string
    slogan?: string
  }
  contacto: {
    direccion: string
    ciudad: string
    codigoPostal?: string
    telefono: string
    email: string
    horario?: string
  }
  admin: {
    email: string
    password: string
    nombre: string
    apellido: string
    cargo?: string
  }
  redes?: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
}

// ─── Roles (genérico) ───────────────────────────────────────────────────────────
// El `nombre` DEBE ser un identificador del enum Role del código
// ('SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER'); la autorización compara contra él.
// La etiqueta legible va en `descripcion`.
export async function seedRolesTenant(prisma: any) {
  const roles = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'SUPER_ADMIN' },
      update: {},
      create: {
        nombre: 'SUPER_ADMIN',
        descripcion: 'Super Administrador — acceso total al sistema',
        esProtegido: true,
        permisos: {
          usuarios: ['crear', 'leer', 'actualizar', 'eliminar'],
          roles: ['crear', 'leer', 'actualizar', 'eliminar'],
          contenidos: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          transparencia: ['crear', 'leer', 'actualizar', 'eliminar'],
          noticias: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          pqrs: ['crear', 'leer', 'actualizar', 'eliminar', 'responder', 'asignar'],
          configuracion: ['leer', 'actualizar'],
          auditoria: ['leer'],
        },
      },
    }),
    prisma.rol.upsert({
      where: { nombre: 'ADMIN' },
      update: {},
      create: {
        nombre: 'ADMIN',
        descripcion: 'Administrador — administración general del sitio',
        esProtegido: true,
        permisos: {
          usuarios: ['crear', 'leer', 'actualizar'],
          contenidos: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          transparencia: ['crear', 'leer', 'actualizar', 'eliminar'],
          noticias: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          pqrs: ['leer', 'actualizar', 'responder', 'asignar'],
          configuracion: ['leer', 'actualizar'],
        },
      },
    }),
    prisma.rol.upsert({
      where: { nombre: 'EDITOR' },
      update: {},
      create: {
        nombre: 'EDITOR',
        descripcion: 'Editor — gestión de contenidos, noticias y PQRS',
        esProtegido: false,
        permisos: {
          contenidos: ['crear', 'leer', 'actualizar'],
          transparencia: ['leer', 'actualizar'],
          noticias: ['crear', 'leer', 'actualizar'],
          pqrs: ['leer', 'actualizar', 'responder'],
        },
      },
    }),
    prisma.rol.upsert({
      where: { nombre: 'USER' },
      update: {},
      create: {
        nombre: 'USER',
        descripcion: 'Consulta — solo lectura',
        esProtegido: false,
        permisos: {
          contenidos: ['leer'],
          transparencia: ['leer'],
          noticias: ['leer'],
          pqrs: ['leer'],
        },
      },
    }),
  ])
  return roles
}

// ─── Usuario administrador (parametrizado) ───────────────────────────────────────
export async function seedAdminUsuario(prisma: any, adminRoleId: string, admin: SeedTenantParams['admin']) {
  const hashedPassword = await hash(admin.password, 12)
  return prisma.usuario.upsert({
    where: { email: admin.email },
    update: {},
    create: {
      email: admin.email,
      password: hashedPassword,
      nombre: admin.nombre,
      apellido: admin.apellido,
      cargo: admin.cargo ?? 'Administrador del Sistema',
      activo: true,
      rolId: adminRoleId,
    },
  })
}

// ─── Taxonomía de transparencia (genérica, Resolución 1519 de 2020) ──────────────
const CATEGORIAS_TRANSPARENCIA = [
  { numero: 1, nombre: 'Información de la Entidad', slug: 'informacion-entidad', descripcion: 'Mecanismos de contacto, información de interés, estructura orgánica y talento humano', icono: 'building', subcategorias: [
    { codigo: '1.1', nombre: 'Mecanismos de contacto', slug: 'mecanismos-contacto' },
    { codigo: '1.2', nombre: 'Información de interés', slug: 'informacion-interes' },
    { codigo: '1.3', nombre: 'Estructura orgánica y talento humano', slug: 'estructura-organica' },
  ] },
  { numero: 2, nombre: 'Normativa', slug: 'normativa', descripcion: 'Normatividad que rige a la entidad y normatividad aplicable', icono: 'scale', subcategorias: [
    { codigo: '2.1', nombre: 'Normativa de la entidad', slug: 'normativa-entidad' },
    { codigo: '2.2', nombre: 'Búsqueda de normas', slug: 'busqueda-normas' },
    { codigo: '2.3', nombre: 'Proyectos de normas para comentarios', slug: 'proyectos-normas' },
  ] },
  { numero: 3, nombre: 'Contratación', slug: 'contratacion', descripcion: 'Plan anual de adquisiciones, información contractual y ejecución de contratos', icono: 'file-contract', subcategorias: [
    { codigo: '3.1', nombre: 'Plan anual de adquisiciones', slug: 'plan-adquisiciones' },
    { codigo: '3.2', nombre: 'Publicación de la información contractual', slug: 'informacion-contractual' },
    { codigo: '3.3', nombre: 'Publicación de la ejecución de contratos', slug: 'ejecucion-contratos' },
    { codigo: '3.4', nombre: 'Manual de contratación y supervisión', slug: 'manual-contratacion' },
    { codigo: '3.5', nombre: 'Formatos y modelos de contratos', slug: 'formatos-contratos' },
  ] },
  { numero: 4, nombre: 'Planeación, Presupuesto e Informes', slug: 'planeacion', descripcion: 'Presupuesto general, ejecución presupuestal, plan de acción e informes de gestión', icono: 'chart-bar', subcategorias: [
    { codigo: '4.1', nombre: 'Presupuesto general', slug: 'presupuesto-general' },
    { codigo: '4.2', nombre: 'Ejecución presupuestal', slug: 'ejecucion-presupuestal' },
    { codigo: '4.3', nombre: 'Plan de acción', slug: 'plan-accion' },
    { codigo: '4.4', nombre: 'Proyectos de inversión', slug: 'proyectos-inversion' },
    { codigo: '4.5', nombre: 'Informes de empalme', slug: 'informes-empalme' },
    { codigo: '4.6', nombre: 'Informes de gestión, evaluación y auditoría', slug: 'informes-gestion' },
    { codigo: '4.7', nombre: 'Informes de rendición de cuentas', slug: 'rendicion-cuentas' },
    { codigo: '4.8', nombre: 'Planes de mejoramiento', slug: 'planes-mejoramiento' },
  ] },
  { numero: 5, nombre: 'Trámites y Servicios', slug: 'tramites', descripcion: 'Trámites que se pueden adelantar ante la entidad', icono: 'clipboard-list', subcategorias: [
    { codigo: '5.1', nombre: 'Trámites', slug: 'tramites-listado' },
    { codigo: '5.2', nombre: 'Otros procedimientos administrativos', slug: 'otros-procedimientos' },
  ] },
  { numero: 6, nombre: 'Participa', slug: 'participa', descripcion: 'Mecanismos de participación ciudadana', icono: 'users', subcategorias: [
    { codigo: '6.1', nombre: 'Diagnóstico e identificación de problemas', slug: 'diagnostico-problemas' },
    { codigo: '6.2', nombre: 'Planeación y presupuesto participativo', slug: 'planeacion-participativa' },
    { codigo: '6.3', nombre: 'Consulta ciudadana', slug: 'consulta-ciudadana' },
    { codigo: '6.4', nombre: 'Colaboración e innovación abierta', slug: 'colaboracion-innovacion' },
    { codigo: '6.5', nombre: 'Rendición de cuentas', slug: 'rendicion-cuentas-participa' },
    { codigo: '6.6', nombre: 'Control social', slug: 'control-social' },
  ] },
  { numero: 7, nombre: 'Datos Abiertos', slug: 'datos-abiertos', descripcion: 'Instrumentos de gestión de la información y datos abiertos', icono: 'database', subcategorias: [
    { codigo: '7.1', nombre: 'Datos abiertos', slug: 'datos-abiertos-listado' },
    { codigo: '7.2', nombre: 'Estudios, investigaciones y otras publicaciones', slug: 'estudios-investigaciones' },
  ] },
  { numero: 8, nombre: 'Información Específica para Grupos de Interés', slug: 'informacion-especifica', descripcion: 'Información para ciudadanos, empresarios y contratistas', icono: 'user-group', subcategorias: [
    { codigo: '8.1', nombre: 'Información para ciudadanos', slug: 'info-ciudadanos' },
    { codigo: '8.2', nombre: 'Información para empresarios', slug: 'info-empresarios' },
    { codigo: '8.3', nombre: 'Información para contratistas', slug: 'info-contratistas' },
  ] },
  { numero: 9, nombre: 'Obligación de Reporte de Información Específica', slug: 'obligacion-reporte', descripcion: 'Reportes de información requeridos por organismos de control', icono: 'file-export', subcategorias: [
    { codigo: '9.1', nombre: 'Informes a organismos de inspección', slug: 'informes-inspeccion' },
    { codigo: '9.2', nombre: 'Informes a organismos de regulación', slug: 'informes-regulacion' },
  ] },
  { numero: 10, nombre: 'Información Tributaria', slug: 'informacion-tributaria', descripcion: 'Información tributaria en entidades territoriales (cuando aplique)', icono: 'receipt', subcategorias: [
    { codigo: '10.1', nombre: 'Información tributaria', slug: 'info-tributaria' },
  ] },
]

export async function seedTransparencia(prisma: any) {
  for (const cat of CATEGORIAS_TRANSPARENCIA) {
    const categoria = await prisma.categoriaTransparencia.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        numero: cat.numero, nombre: cat.nombre, slug: cat.slug,
        descripcion: cat.descripcion, icono: cat.icono, orden: cat.numero, esObligatoria: true,
      },
    })
    for (let i = 0; i < cat.subcategorias.length; i++) {
      const sub = cat.subcategorias[i]
      await prisma.subcategoriaTransparencia.upsert({
        where: { slug: sub.slug },
        update: {},
        create: { codigo: sub.codigo, nombre: sub.nombre, slug: sub.slug, orden: i + 1, esObligatoria: true, categoriaId: categoria.id },
      })
    }
  }
  return CATEGORIAS_TRANSPARENCIA.length
}

// ─── Menú principal (genérico) ───────────────────────────────────────────────────
export async function seedMenu(prisma: any) {
  const menuItems = [
    { nombre: 'Inicio', slug: 'inicio', orden: 1, esObligatorio: true },
    { nombre: 'La Entidad', slug: 'entidad', orden: 2, esObligatorio: true },
    { nombre: 'Transparencia', slug: 'transparencia', orden: 3, esObligatorio: true, codigoITA: 'TRANSPARENCIA' },
    { nombre: 'Atención al Ciudadano', slug: 'atencion-ciudadano', orden: 4, esObligatorio: true },
    { nombre: 'Servicios', slug: 'servicios', orden: 5, esObligatorio: false },
    { nombre: 'Noticias', slug: 'noticias', orden: 6, esObligatorio: false },
  ]
  for (const item of menuItems) {
    await prisma.menuPrincipal.upsert({ where: { slug: item.slug }, update: {}, create: item })
  }
  return menuItems.length
}

// ─── Configuración del sitio (parametrizada por cliente) ─────────────────────────
export async function seedConfiguracion(prisma: any, params: SeedTenantParams) {
  const { entidad, contacto, redes } = params
  const horario = contacto.horario ?? 'Lunes a Viernes: 8:00 a.m. - 12:00 m. y 2:00 p.m. - 6:00 p.m.'
  const r = redes ?? {}

  const configuraciones = [
    { clave: 'sitio_nombre', valor: { texto: entidad.nombre }, grupo: 'general', esPublico: true },
    { clave: 'sitio_descripcion', valor: { texto: entidad.slogan ?? '' }, grupo: 'general', esPublico: true },
    { clave: 'sitio_direccion', valor: { texto: contacto.direccion }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_ciudad', valor: { texto: contacto.ciudad }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_codigo_postal', valor: { texto: contacto.codigoPostal ?? '' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_telefono', valor: { texto: contacto.telefono }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_email', valor: { texto: contacto.email }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_horario', valor: { texto: horario }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_nit', valor: { texto: entidad.nit }, grupo: 'legal', esPublico: true },
    { clave: 'pqrs_dias_peticion', valor: { dias: 15 }, grupo: 'pqrs', esPublico: true },
    { clave: 'pqrs_dias_queja', valor: { dias: 15 }, grupo: 'pqrs', esPublico: true },
    { clave: 'pqrs_dias_consulta', valor: { dias: 30 }, grupo: 'pqrs', esPublico: true },
    {
      clave: 'contacto',
      valor: {
        direccion: `${contacto.direccion}, ${contacto.ciudad}`,
        telefono: contacto.telefono, telefonoSecundario: '',
        email: contacto.email, emailSecundario: '', horarioAtencion: horario,
      },
      grupo: 'contacto', esPublico: true, descripcion: 'Información de contacto de la entidad',
    },
    {
      clave: 'redes_sociales',
      valor: {
        facebook: r.facebook ?? '', instagram: r.instagram ?? '', twitter: r.twitter ?? '',
        youtube: r.youtube ?? '', linkedin: r.linkedin ?? '',
      },
      grupo: 'redes', esPublico: true, descripcion: 'Redes sociales de la entidad',
    },
    {
      clave: 'general',
      valor: {
        nombreEntidad: entidad.nombre, nombreCorto: entidad.nombreCorto,
        slogan: entidad.slogan ?? '', nit: entidad.nit, googleAnalyticsId: '', googleMapsEmbed: '',
      },
      grupo: 'general', esPublico: true, descripcion: 'Información general de la entidad',
    },
  ]
  for (const config of configuraciones) {
    await prisma.configuracionSitio.upsert({ where: { clave: config.clave }, update: {}, create: config })
  }
  return configuraciones.length
}

// ─── Categorías de noticias (genérico) ───────────────────────────────────────────
export async function seedCategoriasNoticias(prisma: any) {
  const cats = [
    { nombre: 'Gestión', slug: 'gestion', color: 'bg-green-500' },
    { nombre: 'Derechos Humanos', slug: 'derechos-humanos', color: 'bg-blue-500' },
    { nombre: 'Informes', slug: 'informes', color: 'bg-purple-500' },
    { nombre: 'Eventos', slug: 'eventos', color: 'bg-orange-500' },
    { nombre: 'Comunicados', slug: 'comunicados', color: 'bg-red-500' },
    { nombre: 'Capacitaciones', slug: 'capacitaciones', color: 'bg-teal-500' },
  ]
  for (const cat of cats) {
    await prisma.categoriaNoticias.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
  }
  return cats.length
}

// ─── Festivos colombianos (genérico) ─────────────────────────────────────────────
function calcPascua(anio: number): Date {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(anio, mes - 1, dia, 12, 0, 0)
}
function trasladarLunes(fecha: Date): Date {
  const d = new Date(fecha); const dia = d.getDay()
  if (dia === 1) return d
  if (dia === 0) { d.setDate(d.getDate() + 1); return d }
  d.setDate(d.getDate() + (8 - dia)); return d
}
function festivosDelAnio(anio: number) {
  const fijos = [
    { mes: 1, dia: 1, nombre: 'Año Nuevo' }, { mes: 5, dia: 1, nombre: 'Día del Trabajo' },
    { mes: 7, dia: 20, nombre: 'Grito de Independencia' }, { mes: 8, dia: 7, nombre: 'Batalla de Boyacá' },
    { mes: 12, dia: 8, nombre: 'Inmaculada Concepción' }, { mes: 12, dia: 25, nombre: 'Navidad' },
  ]
  const traslados = [
    { mes: 1, dia: 6, nombre: 'Reyes Magos' }, { mes: 3, dia: 19, nombre: 'San José' },
    { mes: 6, dia: 29, nombre: 'San Pedro y San Pablo' }, { mes: 8, dia: 15, nombre: 'Asunción de la Virgen' },
    { mes: 10, dia: 12, nombre: 'Día de la Raza' }, { mes: 11, dia: 1, nombre: 'Todos los Santos' },
    { mes: 11, dia: 11, nombre: 'Independencia de Cartagena' },
  ]
  const festivos: Array<{ fecha: Date; nombre: string }> = []
  for (const f of fijos) festivos.push({ fecha: new Date(anio, f.mes - 1, f.dia, 12), nombre: f.nombre })
  for (const f of traslados) festivos.push({ fecha: trasladarLunes(new Date(anio, f.mes - 1, f.dia, 12)), nombre: f.nombre })
  const pascua = calcPascua(anio)
  const juevesSanto = new Date(pascua); juevesSanto.setDate(juevesSanto.getDate() - 3)
  const viernesSanto = new Date(pascua); viernesSanto.setDate(viernesSanto.getDate() - 2)
  festivos.push({ fecha: juevesSanto, nombre: 'Jueves Santo' })
  festivos.push({ fecha: viernesSanto, nombre: 'Viernes Santo' })
  const asc = new Date(pascua); asc.setDate(asc.getDate() + 39)
  while (asc.getDay() !== 1) asc.setDate(asc.getDate() + 1)
  festivos.push({ fecha: asc, nombre: 'Ascensión del Señor' })
  const cor = new Date(pascua); cor.setDate(cor.getDate() + 60)
  while (cor.getDay() !== 1) cor.setDate(cor.getDate() + 1)
  festivos.push({ fecha: cor, nombre: 'Corpus Christi' })
  const sag = new Date(pascua); sag.setDate(sag.getDate() + 68)
  while (sag.getDay() !== 1) sag.setDate(sag.getDate() + 1)
  festivos.push({ fecha: sag, nombre: 'Sagrado Corazón de Jesús' })
  return festivos
}
export async function seedFestivos(prisma: any) {
  const base = new Date().getFullYear()
  const anios = [base - 1, base, base + 1, base + 2]
  let total = 0
  for (const anio of anios) {
    for (const f of festivosDelAnio(anio)) {
      await prisma.gdFestivoColombia.upsert({
        where: { fecha: f.fecha }, update: {},
        create: { fecha: f.fecha, nombre: f.nombre, anio, ley: 'Ley 51 de 1983' },
      })
      total++
    }
  }
  return total
}

// ─── Páginas institucionales base (editables en el CMS) ──────────────────────────
// El portal renderiza estas páginas con <PaginaContenido slug="..."> leyendo el
// modelo `Pagina` por slug. Sin estos registros, el portal muestra un placeholder y
// el admin de "Páginas" aparece vacío. Se siembran publicadas y editables.
export async function seedPaginasBase(prisma: any, params: SeedTenantParams) {
  const n = params.entidad.nombre
  const nota = '<em>(Edite este contenido desde el panel de administración → Páginas.)</em>'
  const paginas = [
    {
      slug: 'mision-vision', titulo: 'Misión y Visión',
      descripcion: `Misión y visión de ${n}`,
      html: `<h2>Misión</h2><p>${n} trabaja por la defensa, promoción y protección de los derechos humanos y el patrimonio público, velando por el cumplimiento de la Constitución y la ley. ${nota}</p><h2>Visión</h2><p>Ser una entidad reconocida por su gestión transparente y su compromiso con la ciudadanía. ${nota}</p>`,
    },
    {
      slug: 'funciones', titulo: 'Funciones',
      descripcion: `Funciones de ${n}`,
      html: `<h2>Funciones</h2><p>Aquí se describen las funciones de ${n} conforme a la normatividad vigente. ${nota}</p>`,
    },
    {
      slug: 'historia', titulo: 'Historia',
      descripcion: `Reseña histórica de ${n}`,
      html: `<h2>Historia</h2><p>Reseña histórica de ${n}. ${nota}</p>`,
    },
    {
      slug: 'organigrama', titulo: 'Organigrama',
      descripcion: `Estructura organizacional de ${n}`,
      html: `<h2>Organigrama</h2><p>Estructura organizacional de ${n}. Puede describir las dependencias o cargar una imagen del organigrama. ${nota}</p>`,
    },
  ]
  for (const p of paginas) {
    await prisma.pagina.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug, titulo: p.titulo, descripcion: p.descripcion,
        contenido: { html: p.html }, plantilla: 'GENERICA', publicada: true,
      },
    })
  }
  return paginas.length
}

// ─── Orquestador ─────────────────────────────────────────────────────────────────
export async function seedTenant(prisma: any, params: SeedTenantParams) {
  const roles = await seedRolesTenant(prisma)
  const superAdmin = roles.find((r: any) => r.nombre === 'SUPER_ADMIN')!
  const admin = await seedAdminUsuario(prisma, superAdmin.id, params.admin)
  await seedTransparencia(prisma)
  await seedMenu(prisma)
  await seedPaginasBase(prisma, params)
  await seedConfiguracion(prisma, params)
  await seedCategoriasNoticias(prisma)
  await seedFestivos(prisma)
  return { adminEmail: admin.email, roles: roles.length }
}
