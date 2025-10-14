import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { action, routeId } = await request.json();

    if (action === 'start') {
      // Start delivery
      const { error } = await supabase
        .from('transport_routes')
        .update({ 
          status: 'in_transit',
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        message: 'Delivery started successfully' 
      });

    } else if (action === 'complete') {
      // Get route details
      const { data: route, error: routeError } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('id', routeId)
        .single();

      if (routeError) throw routeError;

      // Update destination storage facility if there's a pending delivery
      if (route.destination_storage_id && route.pending_delivery_kg) {
        const { data: storageData, error: storageGetError } = await supabase
          .from('storage_facilities')
          .select('current_level_kg')
          .eq('id', route.destination_storage_id)
          .single();

        if (storageGetError) throw storageGetError;

        const newLevel = (storageData.current_level_kg || 0) + route.pending_delivery_kg;
        const { error: storageError } = await supabase
          .from('storage_facilities')
          .update({
            current_level_kg: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', route.destination_storage_id);

        if (storageError) throw storageError;
      }

      // Update route status to completed
      const { error: updateError } = await supabase
        .from('transport_routes')
        .update({ 
          status: 'delivered',
          current_load_kg: 0,
          destination_storage_id: null,
          pending_delivery_kg: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        message: 'Delivery completed successfully' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Delivery API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
