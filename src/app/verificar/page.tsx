import { getTenantPrisma } from "@/lib/tenant"
import { notFound } from "next/navigation"
import { CheckCircle, AlertTriangle, FileText, Download } from "lucide-react"

export default async function VerificarDocumentoPage({ searchParams }: { searchParams: Promise<{ hash?: string }> }) {
  const { hash } = await searchParams
  if (!hash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Hash Inválido</h1>
          <p className="text-gray-600 text-sm">Debe proveer un hash criptográfico válido en la URL para verificar la autenticidad del documento.</p>
        </div>
      </div>
    )
  }

  const prisma = await getTenantPrisma()

  // Buscar la firma en la BD local
  const firma = await prisma.gdFirmaQr.findUnique({
    where: { hashFirma: hash },
    include: {
      documento: {
        include: { radicado: { include: { dependencia: true } } }
      },
      firmante: { select: { nombre: true, apellido: true, cargo: true, email: true } }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4 md:px-6">
      <div className="w-full max-w-3xl">
        {/* Cabecera Pera Verificación */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gov-blue">Portal de Verificación de Integridad</h1>
          <p className="text-gray-500 mt-2">Valide la autenticidad de los documentos electrónicos emitidos por la Personería.</p>
        </div>

        {!firma ? (
          <div className="bg-white rounded-2xl p-8 shadow-md border-t-4 border-red-500 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Documento No Encontrado o Alterado</h2>
            <p className="text-gray-600 mt-2">
              El hash criptográfico consultado <strong>no existe</strong> en nuestra base de datos inmutable.
              Esto significa que el documento provisto puede ser falso o haber sido modificado ilegalmente.
            </p>
            <div className="mt-6 bg-red-50 text-red-700 font-mono text-xs p-4 rounded text-left break-all">
              HASH A REVISAR: {hash}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-emerald-100 p-3 rounded-full mb-3">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Documento Electrónico Válido</h2>
              <p className="text-emerald-700 font-medium text-sm mt-1">Este documento es auténtico y no ha sido modificado.</p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Criptografía SHA-256</p>
                  <p className="font-mono text-xs bg-gray-100 text-gray-600 p-2 rounded truncate" title={firma.hashFirma}>{firma.hashFirma}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Generado El</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(firma.fechaFirma).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Firmado Electrónicamente Por</p>
                  <p className="text-sm font-bold text-gray-900">{firma.firmante.nombre} {firma.firmante.apellido}</p>
                  <p className="text-xs text-gray-500">{firma.firmante.cargo ?? firma.firmante.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">N° de Radicado Oficial Asignado</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-2.5 py-1 rounded">
                      {firma.documento.radicado.numero}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg"><FileText className="w-6 h-6 text-red-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{firma.documento.nombre}</p>
                      <p className="text-xs text-gray-500">Documento Oficial en Formato HTML</p>
                    </div>
                  </div>
                  <a 
                    href={firma.documento.archivoUrl} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gov-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors w-full md:w-auto justify-center"
                  >
                    <Download className="w-4 h-4" /> Visualizar Original
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
