-- Migration to fix transport workflow
-- Add columns to track destination storage and pending deliveries

-- Add new columns to transport_routes table
ALTER TABLE public.transport_routes 
ADD COLUMN IF NOT EXISTS destination_storage_id UUID REFERENCES public.storage_facilities(id),
ADD COLUMN IF NOT EXISTS pending_delivery_kg NUMERIC DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.transport_routes.destination_storage_id IS 'Storage facility where the H2 will be delivered';
COMMENT ON COLUMN public.transport_routes.pending_delivery_kg IS 'Amount of H2 to be delivered to destination storage';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transport_routes_destination_storage ON public.transport_routes(destination_storage_id);
