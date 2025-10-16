import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get daily production targets for user's facilities
    const { data, error } = await supabase
      .from('daily_production_targets')
      .select(`
        *,
        production_facilities!inner(
          id,
          name,
          user_id,
          approval_status
        )
      `)
      .eq('production_facilities.user_id', user.id)
      .eq('production_facilities.approval_status', 'approved')
      .order('target_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching daily targets:', error);
    return NextResponse.json({ error: 'Failed to fetch daily targets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facility_id, actual_production_kg } = body;

    // Verify user owns the facility
    const { data: facility } = await supabase
      .from('production_facilities')
      .select('id')
      .eq('id', facility_id)
      .eq('user_id', user.id)
      .single();

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found or unauthorized' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Update or create today's production record
    const { data, error } = await supabase
      .from('daily_production_targets')
      .upsert({
        facility_id,
        target_date: today,
        actual_production_kg,
        status: actual_production_kg >= 2 ? 'completed' : 'pending',
        target_production_kg: 2
      })
      .select();

    if (error) throw error;

    // Create alert if target not met
    if (actual_production_kg < 2) {
      await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          alert_type: 'production_alert',
          title: 'Production Target Not Met',
          message: `Facility ${facility_id} produced ${actual_production_kg} kg today, below the target of 2 kg.`,
          severity: 'warning',
          related_table: 'production_facilities',
          related_id: facility_id
        });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating daily production:', error);
    return NextResponse.json({ error: 'Failed to update daily production' }, { status: 500 });
  }
}

// Function to create daily targets for all approved facilities
export async function PUT() {
  try {
    // This endpoint is for system use to create daily targets
    const today = new Date().toISOString().split('T')[0];

    // Get all approved production facilities
    const { data: facilities } = await supabase
      .from('production_facilities')
      .select('id, user_id')
      .eq('approval_status', 'approved')
      .eq('status', 'operational');

    if (!facilities) return NextResponse.json({ message: 'No facilities found' });

    // Create daily targets for each facility
    const targets = facilities.map(facility => ({
      facility_id: facility.id,
      target_date: today,
      target_production_kg: 2,
      actual_production_kg: 0,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('daily_production_targets')
      .upsert(targets, { 
        onConflict: 'facility_id,target_date',
        ignoreDuplicates: true 
      });

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Daily targets created successfully',
      count: targets.length 
    });
  } catch (error) {
    console.error('Error creating daily targets:', error);
    return NextResponse.json({ error: 'Failed to create daily targets' }, { status: 500 });
  }
}
