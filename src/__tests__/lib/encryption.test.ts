/**
 * encryption.test.ts
 * Tests para AES-256-GCM encrypt/decrypt y funciones de secretos por tenant.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { encrypt, decrypt, encryptSecretos, decryptSecretos, type TenantSecretos } from '@/lib/encryption'

// ─── Setup: clave de prueba ───────────────────────────────────────────────────

// Clave AES-256 de prueba: 32 bytes = 64 caracteres hex
const TEST_KEY = 'a'.repeat(64)   // Solo para tests

beforeEach(() => {
  process.env.SECRETS_ENCRYPTION_KEY = TEST_KEY
})

afterEach(() => {
  delete process.env.SECRETS_ENCRYPTION_KEY
})

// ─── encrypt / decrypt ────────────────────────────────────────────────────────

describe('encrypt', () => {
  it('retorna una cadena en formato iv:tag:ciphertext', () => {
    const resultado = encrypt('hola mundo')
    const partes = resultado.split(':')
    expect(partes).toHaveLength(3)
    // IV = 12 bytes = 24 chars hex
    expect(partes[0]).toHaveLength(24)
    // Auth tag = 16 bytes = 32 chars hex
    expect(partes[1]).toHaveLength(32)
    // Ciphertext no vacío
    expect(partes[2].length).toBeGreaterThan(0)
  })

  it('produce resultados diferentes en cada llamada (IV aleatorio)', () => {
    const texto = 'misma clave, mismo texto'
    const r1 = encrypt(texto)
    const r2 = encrypt(texto)
    expect(r1).not.toBe(r2)  // El IV es aleatorio
  })

  it('puede cifrar cadenas vacías', () => {
    const resultado = encrypt('')
    expect(resultado.split(':').length).toBe(3)
  })

  it('puede cifrar cadenas con caracteres especiales y unicode', () => {
    const texto = 'Clave GROQ: gsk_abc123 — Contraseña: P@$$w0rd! 🔐 → ñ ü é'
    const cifrado = encrypt(texto)
    const descifrado = decrypt(cifrado)
    expect(descifrado).toBe(texto)
  })

  it('puede cifrar cadenas largas (JSON grande)', () => {
    const json = JSON.stringify({ key: 'a'.repeat(1000), value: 'b'.repeat(1000) })
    const cifrado = encrypt(json)
    const descifrado = decrypt(cifrado)
    expect(descifrado).toBe(json)
  })

  it('lanza error si SECRETS_ENCRYPTION_KEY no está definida', () => {
    delete process.env.SECRETS_ENCRYPTION_KEY
    expect(() => encrypt('texto')).toThrow('SECRETS_ENCRYPTION_KEY no definida')
  })

  it('lanza error si la clave no tiene exactamente 32 bytes', () => {
    process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(10)  // muy corta
    expect(() => encrypt('texto')).toThrow('32 bytes')
  })
})

describe('decrypt', () => {
  it('descifra correctamente lo que cifró encrypt', () => {
    const original = 'api-key-super-secreta-gsk_12345'
    const cifrado = encrypt(original)
    const descifrado = decrypt(cifrado)
    expect(descifrado).toBe(original)
  })

  it('es inversa exacta de encrypt para texto con saltos de línea', () => {
    const texto = 'linea 1\nlinea 2\nlinea 3'
    expect(decrypt(encrypt(texto))).toBe(texto)
  })

  it('lanza error con formato inválido (menos de 3 partes)', () => {
    expect(() => decrypt('solouna')).toThrow('Formato de ciphertext inválido')
  })

  it('lanza error con formato inválido (2 partes)', () => {
    expect(() => decrypt('abc:def')).toThrow('Formato de ciphertext inválido')
  })

  it('lanza error (GCM auth tag) si el ciphertext fue alterado', () => {
    const cifrado = encrypt('texto original')
    const partes = cifrado.split(':')
    // Modificar el último carácter del ciphertext
    partes[2] = partes[2].slice(0, -2) + '00'
    const alterado = partes.join(':')
    expect(() => decrypt(alterado)).toThrow()
  })

  it('lanza error (GCM auth tag) si se cambia el auth tag', () => {
    const cifrado = encrypt('texto original')
    const partes = cifrado.split(':')
    // Cambiar el auth tag
    partes[1] = '0'.repeat(32)
    const alterado = partes.join(':')
    expect(() => decrypt(alterado)).toThrow()
  })

  it('lanza error si SECRETS_ENCRYPTION_KEY no está definida', () => {
    const cifrado = encrypt('texto')
    delete process.env.SECRETS_ENCRYPTION_KEY
    expect(() => decrypt(cifrado)).toThrow('SECRETS_ENCRYPTION_KEY no definida')
  })
})

// ─── encryptSecretos / decryptSecretos ────────────────────────────────────────

describe('encryptSecretos', () => {
  it('retorna una cadena con 3 partes separadas por :', () => {
    const secretos: TenantSecretos = { groqApiKey: 'gsk_test123' }
    const cifrado = encryptSecretos(secretos)
    expect(cifrado.split(':').length).toBe(3)
  })

  it('cifra todos los campos de TenantSecretos', () => {
    const secretos: TenantSecretos = {
      groqApiKey:   'gsk_test',
      smtpPassword: 'smtp_pass',
      sftpPassword: 'sftp_pass',
      r2SecretKey:  'r2_secret',
    }
    const cifrado = encryptSecretos(secretos)
    // El ciphertext no debe contener los valores en claro
    expect(cifrado).not.toContain('gsk_test')
    expect(cifrado).not.toContain('smtp_pass')
  })
})

describe('decryptSecretos', () => {
  it('recupera exactamente el objeto original', () => {
    const secretos: TenantSecretos = {
      groqApiKey:   'gsk_my_real_key',
      smtpPassword: 'mi_contraseña_smtp',
    }
    const cifrado = encryptSecretos(secretos)
    const recuperado = decryptSecretos(cifrado)

    expect(recuperado.groqApiKey).toBe('gsk_my_real_key')
    expect(recuperado.smtpPassword).toBe('mi_contraseña_smtp')
  })

  it('retorna objeto vacío cuando ciphertext es null', () => {
    expect(decryptSecretos(null)).toEqual({})
  })

  it('retorna objeto vacío cuando ciphertext es undefined', () => {
    expect(decryptSecretos(undefined)).toEqual({})
  })

  it('retorna objeto vacío cuando ciphertext es string vacío', () => {
    expect(decryptSecretos('')).toEqual({})
  })

  it('retorna objeto vacío (sin lanzar) si el ciphertext es inválido', () => {
    // No debe lanzar, debe retornar vacío con gracia
    expect(decryptSecretos('basura:no:valid')).toEqual({})
  })

  it('retorna objeto vacío si el JSON interno es inválido', () => {
    // Construir un ciphertext que descifre a "not-json"
    // Primero ciframos algo que no es JSON válido para el parser
    const cifradoNoJson = encrypt('esto-no-es-json')
    // decryptSecretos debería retornar {} sin lanzar
    const resultado = decryptSecretos(cifradoNoJson)
    expect(resultado).toEqual({})
  })

  it('funciona con objeto de secretos que tiene solo groqApiKey', () => {
    const secretos: TenantSecretos = { groqApiKey: 'gsk_only_key' }
    const recuperado = decryptSecretos(encryptSecretos(secretos))
    expect(recuperado.groqApiKey).toBe('gsk_only_key')
    expect(recuperado.smtpPassword).toBeUndefined()
  })

  it('la round-trip es determinista: múltiples cifrados del mismo objeto se descifran igual', () => {
    const secretos: TenantSecretos = { groqApiKey: 'test_key', smtpPassword: 'test_smtp' }
    const c1 = encryptSecretos(secretos)
    const c2 = encryptSecretos(secretos)
    // Los ciphertexts son distintos (IV aleatorio)
    expect(c1).not.toBe(c2)
    // Pero ambos descifran al mismo objeto
    expect(decryptSecretos(c1)).toEqual(decryptSecretos(c2))
  })
})
