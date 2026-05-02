'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-[#C9A96E] tracking-[0.3em]">
            NATIVA
          </h1>
          <p className="text-[11px] text-[#888888] uppercase tracking-wider mt-2">
            Models - Gestion
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label 
              htmlFor="email" 
              className="block text-[11px] text-[#888888] uppercase tracking-wider mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-lg px-4 py-3 text-[#E8E8E8] placeholder:text-[#555555] focus:outline-none focus:border-[#C9A96E] transition-colors"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-[11px] text-[#888888] uppercase tracking-wider mb-2"
            >
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111111] border border-[rgba(201,169,110,0.15)] rounded-lg px-4 py-3 text-[#E8E8E8] placeholder:text-[#555555] focus:outline-none focus:border-[#C9A96E] transition-colors"
              placeholder="********"
              required
            />
          </div>

          {error && (
            <p className="text-[#EF4444] text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A96E] hover:bg-[#9A7A4A] text-[#0A0A0A] font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? <Spinner className="w-5 h-5" /> : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
