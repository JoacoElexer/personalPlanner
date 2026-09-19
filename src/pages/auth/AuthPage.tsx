import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarCheck2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

type Mode = 'signin' | 'signup'

const signInSchema = z.object({
  email: z.string().min(1, 'Ingresá tu correo').email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const signUpSchema = signInSchema.extend({
  displayName: z.string().min(1, 'Ingresá tu nombre'),
})

type SignInValues = z.infer<typeof signInSchema>
type SignUpValues = z.infer<typeof signUpSchema>

function SetupInstructions() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Configuración de Supabase pendiente</CardTitle>
        <CardDescription>
          Para usar la app necesitás conectar un proyecto de Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          1. Creá un proyecto en <span className="font-mono">supabase.com</span>
          .
        </p>
        <p>
          2. Ejecutá la migración{' '}
          <span className="font-mono">supabase/migrations/0001_init.sql</span>.
        </p>
        <p>
          3. Copiá la URL y la <span className="font-mono">anon key</span> a un
          archivo <span className="font-mono">.env</span>:
        </p>
        <pre className="rounded-lg bg-muted p-3 text-xs">
          {`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p>4. Reiniciá el proceso.</p>
      </CardContent>
    </Card>
  )
}

export function AuthPage() {
  const { loading, error, signIn, signUp, clearError } = useAuthStore()
  const [mode, setMode] = useState<Mode>('signin')
  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  })
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '' },
    mode: 'onSubmit',
  })

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <CalendarCheck2 className="size-7" />
          Personal Planner
        </div>
        <SetupInstructions />
      </main>
    )
  }

  const handleSignIn = signInForm.handleSubmit(async (values) => {
    clearError()
    await signIn(values.email, values.password)
  })

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    clearError()
    await signUp(values.email, values.password, values.displayName)
  })

  const errorText = error
    ? error.toLowerCase().includes('confirm')
      ? 'Revisá tu correo y confirmá la cuenta antes de entrar.'
      : error
    : null

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <CalendarCheck2 className="size-7" />
        Personal Planner
      </div>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Registrarse</TabsTrigger>
        </TabsList>

        <Card className="mt-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Tu planificador de tareas, en todos tus dispositivos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="signin"
              onSubmit={handleSignIn}
              className={mode === 'signin' ? 'space-y-4' : 'hidden'}
            >
              <div className="space-y-2">
                <Label htmlFor="signin-email">Correo electrónico</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  {...signInForm.register('email')}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  {...signInForm.register('password')}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>

            <form
              id="signup"
              onSubmit={handleSignUp}
              className={mode === 'signup' ? 'space-y-4' : 'hidden'}
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nombre</Label>
                <Input
                  id="signup-name"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  {...signUpForm.register('displayName')}
                />
                {signUpForm.formState.errors.displayName && (
                  <p className="text-xs text-destructive">
                    {signUpForm.formState.errors.displayName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Correo electrónico</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  {...signUpForm.register('email')}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  {...signUpForm.register('password')}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando…' : 'Crear cuenta'}
              </Button>
            </form>

            {errorText && (
              <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {errorText}
              </p>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
