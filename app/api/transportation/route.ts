import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin to see all routes or just their own
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, admin_status')
      .eq('id', user.id)
      .single();

    let query = supabase.from('transport_routes').select('*');
    
    // If not admin, only show user's own routes
    if (profile?.role !== 'admin' || profile?.admin_status !== 'active') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Add user_id and set initial approval status
    const routeData = {
      ...body,
      user_id: user.id,
      approval_status: 'pending',
      admin_authorized: false,
      vehicle_filled: false,
      status: 'scheduled'
    };

    const { data, error } = await supabase
      .from('transport_routes')
      .insert([routeData])
      .select();
    
    if (error) throw error;

    // Create alert for admin approval
    await supabase
      .from('alerts')
      .insert({
        alert_type: 'approval_request',
        title: 'New Transport Route Approval Required',
        message: `Transport route "${routeData.route_name}" requires admin approval.`,
        severity: 'warning',
        related_table: 'transport_routes',
        related_id: data[0].id
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { route_id, action, ...updateData } = body;

    // Check if user is admin for authorization actions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, admin_status')
      .eq('id', user.id)
      .single();

    if (action === 'authorize' && (profile?.role !== 'admin' || profile?.admin_status !== 'active')) {
      return NextResponse.json({ error: 'Only admins can authorize routes' }, { status: 403 });
    }

    let updateFields = updateData;
    
    if (action === 'authorize') {
      updateFields = {
        admin_authorized: true,
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      };
    } else if (action === 'fill_vehicle') {
      updateFields = {
        vehicle_filled: true,
        current_load_kg: updateData.load_kg
      };
    }

    const { data, error } = await supabase
      .from('transport_routes')
      .update(updateFields)
      .eq('id', route_id)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const route_id = searchParams.get('id');

    if (!route_id) {
      return NextResponse.json({ error: 'Route ID required' }, { status: 400 });
    }

    // Check if user owns the route or is admin
    const { data: route } = await supabase
      .from('transport_routes')
      .select('user_id')
      .eq('id', route_id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, admin_status')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' && profile?.admin_status === 'active';
    const isOwner = route?.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized to delete this route' }, { status: 403 });
    }

    const { error } = await supabase
      .from('transport_routes')
      .delete()
      .eq('id', route_id);

    if (error) throw error;

    return NextResponse.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
