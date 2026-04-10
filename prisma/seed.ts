import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { hash } from 'bcryptjs'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter }) as any

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ==========================================
  // ROLES DEL SISTEMA
  // ==========================================
  console.log('📋 Creando roles...')
  
  const roles = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: 'Super Administrador' },
      update: {},
      create: {
        nombre: 'Super Administrador',
        descripcion: 'Acceso total al sistema',
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
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'Administrador' },
      update: {},
      create: {
        nombre: 'Administrador',
        descripcion: 'Administración general del sitio',
        esProtegido: true,
        permisos: {
          usuarios: ['crear', 'leer', 'actualizar'],
          contenidos: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          transparencia: ['crear', 'leer', 'actualizar', 'eliminar'],
          noticias: ['crear', 'leer', 'actualizar', 'eliminar', 'publicar'],
          pqrs: ['leer', 'actualizar', 'responder', 'asignar'],
          configuracion: ['leer', 'actualizar'],
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'Editor' },
      update: {},
      create: {
        nombre: 'Editor',
        descripcion: 'Gestión de contenidos y noticias',
        esProtegido: false,
        permisos: {
          contenidos: ['crear', 'leer', 'actualizar'],
          transparencia: ['leer', 'actualizar'],
          noticias: ['crear', 'leer', 'actualizar'],
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'Funcionario PQRS' },
      update: {},
      create: {
        nombre: 'Funcionario PQRS',
        descripcion: 'Gestión de PQRS',
        esProtegido: false,
        permisos: {
          pqrs: ['leer', 'actualizar', 'responder'],
        }
      }
    }),
    prisma.rol.upsert({
      where: { nombre: 'Consulta' },
      update: {},
      create: {
        nombre: 'Consulta',
        descripcion: 'Solo lectura',
        esProtegido: false,
        permisos: {
          contenidos: ['leer'],
          transparencia: ['leer'],
          noticias: ['leer'],
          pqrs: ['leer'],
        }
      }
    }),
  ])

  console.log(`✅ ${roles.length} roles creados`)

  // ==========================================
  // USUARIO ADMINISTRADOR
  // ==========================================
  console.log('👤 Creando usuario administrador...')
  
  const adminRole = roles.find(r => r.nombre === 'Super Administrador')!
  const hashedPassword = await hash('Admin123*', 12)
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@personeriabuga.gov.co' },
    update: {},
    create: {
      email: 'admin@personeriabuga.gov.co',
      password: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      cargo: 'Administrador del Sistema',
      activo: true,
      rolId: adminRole.id,
    }
  })

  console.log(`✅ Usuario admin creado: ${admin.email}`)

  // ==========================================
  // CATEGORÍAS DE TRANSPARENCIA - Resolución 1519 de 2020
  // ==========================================
  console.log('📂 Creando categorías de transparencia...')

  const categoriasData = [
    {
      numero: 1,
      nombre: 'Información de la Entidad',
      slug: 'informacion-entidad',
      descripcion: 'Mecanismos de contacto, información de interés, estructura orgánica y talento humano',
      icono: 'building',
      subcategorias: [
        { codigo: '1.1', nombre: 'Mecanismos de contacto', slug: 'mecanismos-contacto' },
        { codigo: '1.2', nombre: 'Información de interés', slug: 'informacion-interes' },
        { codigo: '1.3', nombre: 'Estructura orgánica y talento humano', slug: 'estructura-organica' },
      ]
    },
    {
      numero: 2,
      nombre: 'Normativa',
      slug: 'normativa',
      descripcion: 'Normatividad que rige a la entidad y normatividad aplicable',
      icono: 'scale',
      subcategorias: [
        { codigo: '2.1', nombre: 'Normativa de la entidad', slug: 'normativa-entidad' },
        { codigo: '2.2', nombre: 'Búsqueda de normas', slug: 'busqueda-normas' },
        { codigo: '2.3', nombre: 'Proyectos de normas para comentarios', slug: 'proyectos-normas' },
      ]
    },
    {
      numero: 3,
      nombre: 'Contratación',
      slug: 'contratacion',
      descripcion: 'Plan anual de adquisiciones, información contractual y ejecución de contratos',
      icono: 'file-contract',
      subcategorias: [
        { codigo: '3.1', nombre: 'Plan anual de adquisiciones', slug: 'plan-adquisiciones' },
        { codigo: '3.2', nombre: 'Publicación de la información contractual', slug: 'informacion-contractual' },
        { codigo: '3.3', nombre: 'Publicación de la ejecución de contratos', slug: 'ejecucion-contratos' },
        { codigo: '3.4', nombre: 'Manual de contratación y supervisión', slug: 'manual-contratacion' },
        { codigo: '3.5', nombre: 'Formatos y modelos de contratos', slug: 'formatos-contratos' },
      ]
    },
    {
      numero: 4,
      nombre: 'Planeación, Presupuesto e Informes',
      slug: 'planeacion',
      descripcion: 'Presupuesto general, ejecución presupuestal, plan de acción e informes de gestión',
      icono: 'chart-bar',
      subcategorias: [
        { codigo: '4.1', nombre: 'Presupuesto general', slug: 'presupuesto-general' },
        { codigo: '4.2', nombre: 'Ejecución presupuestal', slug: 'ejecucion-presupuestal' },
        { codigo: '4.3', nombre: 'Plan de acción', slug: 'plan-accion' },
        { codigo: '4.4', nombre: 'Proyectos de inversión', slug: 'proyectos-inversion' },
        { codigo: '4.5', nombre: 'Informes de empalme', slug: 'informes-empalme' },
        { codigo: '4.6', nombre: 'Informes de gestión, evaluación y auditoría', slug: 'informes-gestion' },
        { codigo: '4.7', nombre: 'Informes de rendición de cuentas', slug: 'rendicion-cuentas' },
        { codigo: '4.8', nombre: 'Planes de mejoramiento', slug: 'planes-mejoramiento' },
      ]
    },
    {
      numero: 5,
      nombre: 'Trámites y Servicios',
      slug: 'tramites',
      descripcion: 'Trámites que se pueden adelantar ante la entidad',
      icono: 'clipboard-list',
      subcategorias: [
        { codigo: '5.1', nombre: 'Trámites', slug: 'tramites-listado' },
        { codigo: '5.2', nombre: 'Otros procedimientos administrativos', slug: 'otros-procedimientos' },
      ]
    },
    {
      numero: 6,
      nombre: 'Participa',
      slug: 'participa',
      descripcion: 'Mecanismos de participación ciudadana',
      icono: 'users',
      subcategorias: [
        { codigo: '6.1', nombre: 'Diagnóstico e identificación de problemas', slug: 'diagnostico-problemas' },
        { codigo: '6.2', nombre: 'Planeación y presupuesto participativo', slug: 'planeacion-participativa' },
        { codigo: '6.3', nombre: 'Consulta ciudadana', slug: 'consulta-ciudadana' },
        { codigo: '6.4', nombre: 'Colaboración e innovación abierta', slug: 'colaboracion-innovacion' },
        { codigo: '6.5', nombre: 'Rendición de cuentas', slug: 'rendicion-cuentas-participa' },
        { codigo: '6.6', nombre: 'Control social', slug: 'control-social' },
      ]
    },
    {
      numero: 7,
      nombre: 'Datos Abiertos',
      slug: 'datos-abiertos',
      descripcion: 'Instrumentos de gestión de la información y datos abiertos',
      icono: 'database',
      subcategorias: [
        { codigo: '7.1', nombre: 'Datos abiertos', slug: 'datos-abiertos-listado' },
        { codigo: '7.2', nombre: 'Estudios, investigaciones y otras publicaciones', slug: 'estudios-investigaciones' },
      ]
    },
    {
      numero: 8,
      nombre: 'Información Específica para Grupos de Interés',
      slug: 'informacion-especifica',
      descripcion: 'Información para ciudadanos, empresarios y contratistas',
      icono: 'user-group',
      subcategorias: [
        { codigo: '8.1', nombre: 'Información para ciudadanos', slug: 'info-ciudadanos' },
        { codigo: '8.2', nombre: 'Información para empresarios', slug: 'info-empresarios' },
        { codigo: '8.3', nombre: 'Información para contratistas', slug: 'info-contratistas' },
      ]
    },
    {
      numero: 9,
      nombre: 'Obligación de Reporte de Información Específica',
      slug: 'obligacion-reporte',
      descripcion: 'Reportes de información requeridos por organismos de control',
      icono: 'file-export',
      subcategorias: [
        { codigo: '9.1', nombre: 'Informes a organismos de inspección', slug: 'informes-inspeccion' },
        { codigo: '9.2', nombre: 'Informes a organismos de regulación', slug: 'informes-regulacion' },
      ]
    },
    {
      numero: 10,
      nombre: 'Información Tributaria',
      slug: 'informacion-tributaria',
      descripcion: 'Información tributaria en entidades territoriales (No aplica)',
      icono: 'receipt',
      subcategorias: [
        { codigo: '10.1', nombre: 'No aplica para Personería Municipal', slug: 'no-aplica' },
      ]
    },
  ]

  for (const cat of categoriasData) {
    const categoria = await prisma.categoriaTransparencia.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        numero: cat.numero,
        nombre: cat.nombre,
        slug: cat.slug,
        descripcion: cat.descripcion,
        icono: cat.icono,
        orden: cat.numero,
        esObligatoria: true,
      }
    })

    // Crear subcategorías
    for (let i = 0; i < cat.subcategorias.length; i++) {
      const sub = cat.subcategorias[i]
      await prisma.subcategoriaTransparencia.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          codigo: sub.codigo,
          nombre: sub.nombre,
          slug: sub.slug,
          orden: i + 1,
          esObligatoria: true,
          categoriaId: categoria.id,
        }
      })
    }
  }

  console.log(`✅ ${categoriasData.length} categorías de transparencia creadas`)

  // ==========================================
  // MENÚ PRINCIPAL
  // ==========================================
  console.log('📌 Creando menú principal...')

  const menuItems = [
    { nombre: 'Inicio', slug: 'inicio', orden: 1, esObligatorio: true },
    { nombre: 'La Entidad', slug: 'entidad', orden: 2, esObligatorio: true },
    { nombre: 'Transparencia', slug: 'transparencia', orden: 3, esObligatorio: true, codigoITA: 'TRANSPARENCIA' },
    { nombre: 'Atención al Ciudadano', slug: 'atencion-ciudadano', orden: 4, esObligatorio: true },
    { nombre: 'Servicios', slug: 'servicios', orden: 5, esObligatorio: false },
    { nombre: 'Noticias', slug: 'noticias', orden: 6, esObligatorio: false },
  ]

  for (const item of menuItems) {
    await prisma.menuPrincipal.upsert({
      where: { slug: item.slug },
      update: {},
      create: item
    })
  }

  console.log(`✅ ${menuItems.length} items de menú creados`)

  // ==========================================
  // CONFIGURACIÓN INICIAL DEL SITIO
  // ==========================================
  console.log('⚙️ Creando configuración del sitio...')

  const configuraciones = [
    { clave: 'sitio_nombre', valor: { texto: 'Personería Municipal de Guadalajara de Buga' }, grupo: 'general', esPublico: true },
    { clave: 'sitio_descripcion', valor: { texto: 'Defensores de los Derechos Ciudadanos' }, grupo: 'general', esPublico: true },
    { clave: 'sitio_direccion', valor: { texto: 'Carrera 14 # 6-30, Centro' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_ciudad', valor: { texto: 'Guadalajara de Buga, Valle del Cauca' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_codigo_postal', valor: { texto: '763001' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_telefono', valor: { texto: '(602) 2017004' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_email', valor: { texto: 'contacto@personeriabuga.gov.co' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_horario', valor: { texto: 'Lunes a Viernes: 8:00 a.m. - 12:00 m. y 2:00 p.m. - 6:00 p.m.' }, grupo: 'contacto', esPublico: true },
    { clave: 'sitio_nit', valor: { texto: 'XXX.XXX.XXX-X' }, grupo: 'legal', esPublico: true },
    { clave: 'redes_facebook', valor: { url: 'https://facebook.com/personeriabuga' }, grupo: 'redes', esPublico: true },
    { clave: 'redes_twitter', valor: { url: 'https://twitter.com/personeriabuga' }, grupo: 'redes', esPublico: true },
    { clave: 'redes_instagram', valor: { url: 'https://instagram.com/personeriabuga' }, grupo: 'redes', esPublico: true },
    { clave: 'redes_youtube', valor: { url: 'https://youtube.com/personeriabuga' }, grupo: 'redes', esPublico: true },
    { clave: 'pqrs_dias_peticion', valor: { dias: 15 }, grupo: 'pqrs', esPublico: true },
    { clave: 'pqrs_dias_queja', valor: { dias: 15 }, grupo: 'pqrs', esPublico: true },
    { clave: 'pqrs_dias_consulta', valor: { dias: 30 }, grupo: 'pqrs', esPublico: true },
    // WhatsApp
    { 
      clave: 'whatsapp', 
      valor: { 
        activo: true,
        numero: '573000000000',
        mensaje: 'Hola, necesito información sobre los servicios de la Personería',
        nombreAgente: 'Personería de Buga',
        mensajeBienvenida: '¡Hola! 👋 ¿En qué podemos ayudarte hoy?'
      }, 
      grupo: 'whatsapp', 
      esPublico: true,
      descripcion: 'Configuración del botón de WhatsApp'
    },
    // Contacto consolidado
    {
      clave: 'contacto',
      valor: {
        direccion: 'Carrera 14 # 6-30, Centro, Guadalajara de Buga, Valle del Cauca',
        telefono: '(602) 2017004',
        telefonoSecundario: '',
        email: 'contacto@personeriabuga.gov.co',
        emailSecundario: '',
        horarioAtencion: 'Lunes a Viernes: 8:00 a.m. - 12:00 m. y 2:00 p.m. - 6:00 p.m.'
      },
      grupo: 'contacto',
      esPublico: true,
      descripcion: 'Información de contacto de la entidad'
    },
    // Redes sociales consolidado
    {
      clave: 'redes_sociales',
      valor: {
        facebook: 'https://facebook.com/personeriabuga',
        instagram: 'https://instagram.com/personeriabuga',
        twitter: 'https://twitter.com/personeriabuga',
        youtube: 'https://youtube.com/personeriabuga',
        linkedin: ''
      },
      grupo: 'redes',
      esPublico: true,
      descripcion: 'Redes sociales de la entidad'
    },
    // Información general
    {
      clave: 'general',
      valor: {
        nombreEntidad: 'Personería Municipal de Guadalajara de Buga',
        nombreCorto: 'Personería de Buga',
        slogan: 'Defensores del pueblo, guardianes de tus derechos',
        nit: 'XXX.XXX.XXX-X',
        googleAnalyticsId: '',
        googleMapsEmbed: ''
      },
      grupo: 'general',
      esPublico: true,
      descripcion: 'Información general de la entidad'
    },
  ]

  for (const config of configuraciones) {
    await prisma.configuracionSitio.upsert({
      where: { clave: config.clave },
      update: {},
      create: config
    })
  }

  console.log(`✅ ${configuraciones.length} configuraciones creadas`)

  // ==========================================
  // CATEGORÍAS DE NOTICIAS
  // ==========================================
  console.log('📰 Creando categorías de noticias...')

  const categoriasNoticias = [
    { nombre: 'Gestión', slug: 'gestion', color: 'bg-green-500' },
    { nombre: 'Derechos Humanos', slug: 'derechos-humanos', color: 'bg-blue-500' },
    { nombre: 'Informes', slug: 'informes', color: 'bg-purple-500' },
    { nombre: 'Eventos', slug: 'eventos', color: 'bg-orange-500' },
    { nombre: 'Comunicados', slug: 'comunicados', color: 'bg-red-500' },
    { nombre: 'Capacitaciones', slug: 'capacitaciones', color: 'bg-teal-500' },
  ]

  for (const cat of categoriasNoticias) {
    await prisma.categoriaNoticias.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
  }

  console.log(`✅ ${categoriasNoticias.length} categorías de noticias creadas`)

  // ==========================================
  // FESTIVOS COLOMBIANOS (GdFestivoColombia)
  // ==========================================
  console.log('📅 Creando festivos colombianos 2025-2027...')

  // Cálculo de Pascua (Butcher-Meeus)
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
    const d = new Date(fecha)
    const dia = d.getDay()
    if (dia === 1) return d
    if (dia === 0) { d.setDate(d.getDate() + 1); return d }
    d.setDate(d.getDate() + (8 - dia))
    return d
  }

  function festivosDelAnio(anio: number) {
    const fijos: Array<{ mes: number; dia: number; nombre: string }> = [
      { mes: 1, dia: 1, nombre: 'Año Nuevo' },
      { mes: 5, dia: 1, nombre: 'Día del Trabajo' },
      { mes: 7, dia: 20, nombre: 'Grito de Independencia' },
      { mes: 8, dia: 7, nombre: 'Batalla de Boyacá' },
      { mes: 12, dia: 8, nombre: 'Inmaculada Concepción' },
      { mes: 12, dia: 25, nombre: 'Navidad' },
    ]
    const traslados: Array<{ mes: number; dia: number; nombre: string }> = [
      { mes: 1, dia: 6, nombre: 'Reyes Magos' },
      { mes: 3, dia: 19, nombre: 'San José' },
      { mes: 6, dia: 29, nombre: 'San Pedro y San Pablo' },
      { mes: 8, dia: 15, nombre: 'Asunción de la Virgen' },
      { mes: 10, dia: 12, nombre: 'Día de la Raza' },
      { mes: 11, dia: 1, nombre: 'Todos los Santos' },
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

  for (const anio of [2025, 2026, 2027]) {
    const festivos = festivosDelAnio(anio)
    let count = 0
    for (const f of festivos) {
      await prisma.gdFestivoColombia.upsert({
        where: { fecha: f.fecha },
        update: {},
        create: { fecha: f.fecha, nombre: f.nombre, anio, ley: 'Ley 51 de 1983' },
      })
      count++
    }
    console.log(`  ✅ ${anio}: ${count} festivos`)
  }

  console.log('\n✨ Seed completado exitosamente!')
  console.log('📧 Usuario admin: admin@personeriabuga.gov.co')
  console.log('🔑 Contraseña: Admin123*')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
