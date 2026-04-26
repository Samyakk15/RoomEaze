import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HostProfileForm from '@/components/host/HostProfileForm'

export default async function HostProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'host') redirect('/dashboard')

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>My profile</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Keep your contact details updated so students can reach you
        </p>
      </div>

      {!profile.phone && (
        <div style={{
          padding: '12px 16px',
          background: '#FAEEDA',
          border: '0.5px solid #EF9F27',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#633806',
          marginBottom: '20px',
        }}>
          ⚠️ Add your phone number — students need this to contact you after their request is accepted
        </div>
      )}

      <HostProfileForm profile={profile} />
    </div>
  )
}
