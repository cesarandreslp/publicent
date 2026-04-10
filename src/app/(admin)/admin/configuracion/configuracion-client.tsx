'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  MessageCircle, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';

// Tipos para las configuraciones
interface ConfiguracionWhatsApp {
  activo: boolean;
  numero: string;
  mensaje: string;
  nombreAgente: string;
  mensajeBienvenida: string;
}

interface ConfiguracionContacto {
  direccion: string;
  telefono: string;
  telefonoSecundario: string;
  email: string;
  emailSecundario: string;
  horarioAtencion: string;
}

interface ConfiguracionRedesSociales {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

interface ConfiguracionGeneral {
  nombreEntidad: string;
  nombreCorto: string;
  slogan: string;
  nit: string;
  googleAnalyticsId: string;
  googleMapsEmbed: string;
}

// Valores por defecto
const defaultWhatsApp: ConfiguracionWhatsApp = {
  activo: true,
  numero: '573000000000',
  mensaje: 'Hola, necesito información sobre los servicios de la Personería',
  nombreAgente: 'Personería de Buga',
  mensajeBienvenida: '¡Hola! 👋 ¿En qué podemos ayudarte hoy?'
};

const defaultContacto: ConfiguracionContacto = {
  direccion: 'Carrera 14 # 6-22, Centro, Guadalajara de Buga, Valle del Cauca',
  telefono: '(602) 2280000',
  telefonoSecundario: '',
  email: 'contacto@personeriabuga.gov.co',
  emailSecundario: '',
  horarioAtencion: 'Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM'
};

const defaultRedesSociales: ConfiguracionRedesSociales = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  linkedin: ''
};

const defaultGeneral: ConfiguracionGeneral = {
  nombreEntidad: 'Personería Municipal de Guadalajara de Buga',
  nombreCorto: 'Personería de Buga',
  slogan: 'Defensores del pueblo, guardianes de tus derechos',
  nit: '891.900.000-0',
  googleAnalyticsId: '',
  googleMapsEmbed: ''
};

export default function ConfiguracionClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Estados para cada grupo de configuración
  const [whatsapp, setWhatsapp] = useState<ConfiguracionWhatsApp>(defaultWhatsApp);
  const [contacto, setContacto] = useState<ConfiguracionContacto>(defaultContacto);
  const [redesSociales, setRedesSociales] = useState<ConfiguracionRedesSociales>(defaultRedesSociales);
  const [general, setGeneral] = useState<ConfiguracionGeneral>(defaultGeneral);

  // Cargar configuraciones
  const cargarConfiguraciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/configuracion');
      
      if (!response.ok) throw new Error('Error al cargar configuraciones');
      
      const data = await response.json();
      
      // Mapear configuraciones por clave
      data.configuraciones.forEach((config: { clave: string; valor: unknown }) => {
        switch (config.clave) {
          case 'whatsapp':
            setWhatsapp({ ...defaultWhatsApp, ...(config.valor as ConfiguracionWhatsApp) });
            break;
          case 'contacto':
            setContacto({ ...defaultContacto, ...(config.valor as ConfiguracionContacto) });
            break;
          case 'redes_sociales':
            setRedesSociales({ ...defaultRedesSociales, ...(config.valor as ConfiguracionRedesSociales) });
            break;
          case 'general':
            setGeneral({ ...defaultGeneral, ...(config.valor as ConfiguracionGeneral) });
            break;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar las configuraciones' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarConfiguraciones();
  }, [cargarConfiguraciones]);

  // Guardar configuración específica
  const guardarConfiguracion = async (clave: string, valor: unknown, descripcion: string, esPublico: boolean = true) => {
    try {
      setSaving(clave);
      
      const response = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clave,
          valor,
          descripcion,
          grupo: clave.includes('_') ? clave.split('_')[0] : clave,
          esPublico
        })
      });

      if (!response.ok) throw new Error('Error al guardar');
      
      setMensaje({ tipo: 'success', texto: `Configuración de ${clave} guardada exitosamente` });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la configuración' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando configuraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-7 h-7" />
            Configuración del Sitio
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la configuración general del sitio web
          </p>
        </div>
        <button
          onClick={cargarConfiguraciones}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {mensaje.texto}
        </div>
      )}

      {/* Configuración de WhatsApp */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Configuración de WhatsApp
          </h2>
          <p className="text-sm text-green-600 mt-1">
            Configura el botón flotante de WhatsApp para atención al ciudadano
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Activo */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsapp.activo}
                onChange={(e) => setWhatsapp({ ...whatsapp, activo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              {whatsapp.activo ? 'WhatsApp activo' : 'WhatsApp desactivado'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                value={whatsapp.numero}
                onChange={(e) => setWhatsapp({ ...whatsapp, numero: e.target.value })}
                placeholder="573001234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Ejemplo: 573001234567 (57 = Colombia)</p>
            </div>

            {/* Nombre del agente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del agente
              </label>
              <input
                type="text"
                value={whatsapp.nombreAgente}
                onChange={(e) => setWhatsapp({ ...whatsapp, nombreAgente: e.target.value })}
                placeholder="Personería de Buga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje de bienvenida (se muestra en el chat)
            </label>
            <input
              type="text"
              value={whatsapp.mensajeBienvenida}
              onChange={(e) => setWhatsapp({ ...whatsapp, mensajeBienvenida: e.target.value })}
              placeholder="¡Hola! 👋 ¿En qué podemos ayudarte hoy?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Mensaje predeterminado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje predeterminado (se envía al iniciar chat)
            </label>
            <textarea
              value={whatsapp.mensaje}
              onChange={(e) => setWhatsapp({ ...whatsapp, mensaje: e.target.value })}
              rows={2}
              placeholder="Hola, necesito información sobre..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => guardarConfiguracion('whatsapp', whatsapp, 'Configuración del botón de WhatsApp', true)}
              disabled={saving === 'whatsapp'}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving === 'whatsapp' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </h2>
          <p className="text-sm text-blue-600 mt-1">
            Datos de contacto que se muestran en el sitio web
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Dirección */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4" />
              Dirección
            </label>
            <input
              type="text"
              value={contacto.direccion}
              onChange={(e) => setContacto({ ...contacto, direccion: e.target.value })}
              placeholder="Carrera 14 # 6-22, Centro"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Teléfono principal */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4" />
                Teléfono Principal
              </label>
              <input
                type="text"
                value={contacto.telefono}
                onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
                placeholder="(602) 2280000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Teléfono secundario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Secundario (opcional)
              </label>
              <input
                type="text"
                value={contacto.telefonoSecundario}
                onChange={(e) => setContacto({ ...contacto, telefonoSecundario: e.target.value })}
                placeholder="(602) 2280001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Email principal */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4" />
                Correo Electrónico Principal
              </label>
              <input
                type="email"
                value={contacto.email}
                onChange={(e) => setContacto({ ...contacto, email: e.target.value })}
                placeholder="contacto@personeriabuga.gov.co"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email secundario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico Secundario (opcional)
              </label>
              <input
                type="email"
                value={contacto.emailSecundario}
                onChange={(e) => setContacto({ ...contacto, emailSecundario: e.target.value })}
                placeholder="pqrsd@personeriabuga.gov.co"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Horario de atención */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario de Atención
            </label>
            <input
              type="text"
              value={contacto.horarioAtencion}
              onChange={(e) => setContacto({ ...contacto, horarioAtencion: e.target.value })}
              placeholder="Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => guardarConfiguracion('contacto', contacto, 'Información de contacto de la entidad', true)}
              disabled={saving === 'contacto'}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving === 'contacto' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Contacto
            </button>
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <h2 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Redes Sociales
          </h2>
          <p className="text-sm text-purple-600 mt-1">
            URLs de las redes sociales de la entidad
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={redesSociales.facebook}
                onChange={(e) => setRedesSociales({ ...redesSociales, facebook: e.target.value })}
                placeholder="https://facebook.com/personeriabuga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                value={redesSociales.instagram}
                onChange={(e) => setRedesSociales({ ...redesSociales, instagram: e.target.value })}
                placeholder="https://instagram.com/personeriabuga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Twitter/X */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter / X
              </label>
              <input
                type="url"
                value={redesSociales.twitter}
                onChange={(e) => setRedesSociales({ ...redesSociales, twitter: e.target.value })}
                placeholder="https://twitter.com/personeriabuga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube
              </label>
              <input
                type="url"
                value={redesSociales.youtube}
                onChange={(e) => setRedesSociales({ ...redesSociales, youtube: e.target.value })}
                placeholder="https://youtube.com/@personeriabuga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={redesSociales.linkedin}
                onChange={(e) => setRedesSociales({ ...redesSociales, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/personeriabuga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => guardarConfiguracion('redes_sociales', redesSociales, 'Redes sociales de la entidad', true)}
              disabled={saving === 'redes_sociales'}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {saving === 'redes_sociales' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Redes Sociales
            </button>
          </div>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Información General
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Datos generales de la entidad
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nombre de la entidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo de la Entidad
              </label>
              <input
                type="text"
                value={general.nombreEntidad}
                onChange={(e) => setGeneral({ ...general, nombreEntidad: e.target.value })}
                placeholder="Personería Municipal de Guadalajara de Buga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            {/* Nombre corto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Corto
              </label>
              <input
                type="text"
                value={general.nombreCorto}
                onChange={(e) => setGeneral({ ...general, nombreCorto: e.target.value })}
                placeholder="Personería de Buga"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slogan
            </label>
            <input
              type="text"
              value={general.slogan}
              onChange={(e) => setGeneral({ ...general, slogan: e.target.value })}
              placeholder="Defensores del pueblo, guardianes de tus derechos"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* NIT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT
              </label>
              <input
                type="text"
                value={general.nit}
                onChange={(e) => setGeneral({ ...general, nit: e.target.value })}
                placeholder="891.900.000-0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            {/* Google Analytics ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Analytics ID (opcional)
              </label>
              <input
                type="text"
                value={general.googleAnalyticsId}
                onChange={(e) => setGeneral({ ...general, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>

          {/* Google Maps Embed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Google Maps Embed (opcional)
            </label>
            <input
              type="text"
              value={general.googleMapsEmbed}
              onChange={(e) => setGeneral({ ...general, googleMapsEmbed: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copia la URL del iframe de Google Maps para mostrar la ubicación en el sitio
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => guardarConfiguracion('general', general, 'Información general de la entidad', true)}
              disabled={saving === 'general'}
              className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {saving === 'general' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Información General
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
