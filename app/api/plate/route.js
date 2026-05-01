import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('calorie_trackers')
    .select('plate, calorie_goal, protein_goal, carbs_goal, fat_goal, saved_plates')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    plate: data?.plate ?? [],
    calorieGoal: data?.calorie_goal ?? 1800,
    proteinGoal: data?.protein_goal ?? 130,
    carbsGoal: data?.carbs_goal ?? 200,
    fatGoal: data?.fat_goal ?? 60,
    savedPlates: data?.saved_plates ?? [],
  })
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const plate = body.plate ?? []
  const calorieGoal = body.calorieGoal ?? 1800
  const proteinGoal = body.proteinGoal ?? 130
  const carbsGoal = body.carbsGoal ?? 200
  const fatGoal = body.fatGoal ?? 60
  const savedPlates = body.savedPlates ?? []

  const { error } = await supabase.from('calorie_trackers').upsert(
    {
      user_id: user.id,
      plate,
      calorie_goal: calorieGoal,
      protein_goal: proteinGoal,
      carbs_goal: carbsGoal,
      fat_goal: fatGoal,
      saved_plates: savedPlates,
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
