import { Metadata } from "next"
import { SliderClient } from "./slider-client"

export const metadata: Metadata = {
  title: "Gestión de Slider | Panel de Administración",
  description: "Administrar slides y banners del sitio",
}

export default function SliderPage() {
  return <SliderClient />
}
