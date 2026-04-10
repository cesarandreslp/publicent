/**
 * Página de Configuración del Sitio (Admin)
 * 
 * @description Panel para gestionar configuraciones generales del sitio
 * incluyendo WhatsApp, redes sociales, información de contacto, etc.
 */

import { Metadata } from 'next';
import ConfiguracionClient from './configuracion-client';

export const metadata: Metadata = {
  title: 'Configuración del Sitio - Admin',
  description: 'Gestión de configuración del sitio web',
};

export default function ConfiguracionPage() {
  return <ConfiguracionClient />;
}
