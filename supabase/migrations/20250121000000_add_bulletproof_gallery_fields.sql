-- Add bulletproof fields to gallery_images table
-- This migration adds fields for health monitoring and fallback URLs

-- Add new columns for bulletproof functionality
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS public_url TEXT,
ADD COLUMN IF NOT EXISTS fallback_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'error')),
ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for health status queries
CREATE INDEX IF NOT EXISTS idx_gallery_images_health_status ON gallery_images(health_status);

-- Create index for last_checked queries
CREATE INDEX IF NOT EXISTS idx_gallery_images_last_checked ON gallery_images(last_checked);

-- Update existing images to have health_status = 'healthy' if not set
UPDATE gallery_images 
SET health_status = 'healthy' 
WHERE health_status IS NULL;

-- Update existing images to have last_checked = NOW() if not set
UPDATE gallery_images 
SET last_checked = NOW() 
WHERE last_checked IS NULL;

-- Function to update image health status
CREATE OR REPLACE FUNCTION update_image_health_status(
  image_id UUID,
  new_health_status TEXT,
  new_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE gallery_images 
  SET 
    health_status = new_health_status,
    last_checked = NOW(),
    url = COALESCE(new_url, url)
  WHERE id = image_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get working URL for an image
CREATE OR REPLACE FUNCTION get_working_image_url(image_id UUID)
RETURNS TEXT AS $$
DECLARE
  image_record RECORD;
  working_url TEXT;
BEGIN
  -- Get image data
  SELECT * INTO image_record 
  FROM gallery_images 
  WHERE id = image_id;
  
  IF NOT FOUND THEN
    RETURN '/placeholder.svg';
  END IF;
  
  -- Return primary URL if health is good
  IF image_record.health_status = 'healthy' THEN
    RETURN image_record.url;
  END IF;
  
  -- Try fallback URLs
  IF image_record.fallback_urls IS NOT NULL THEN
    FOREACH working_url IN ARRAY image_record.fallback_urls
    LOOP
      -- In a real implementation, you'd test the URL here
      -- For now, just return the first fallback
      RETURN working_url;
    END LOOP;
  END IF;
  
  -- All failed, return placeholder
  RETURN '/placeholder.svg';
END;
$$ LANGUAGE plpgsql;

-- View for gallery health monitoring
CREATE OR REPLACE VIEW gallery_health_summary AS
SELECT 
  COUNT(*) as total_images,
  COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy_images,
  COUNT(*) FILTER (WHERE health_status = 'warning') as warning_images,
  COUNT(*) FILTER (WHERE health_status = 'error') as error_images,
  ROUND(
    (COUNT(*) FILTER (WHERE health_status = 'healthy')::DECIMAL / COUNT(*)::DECIMAL) * 100, 
    1
  ) as health_percentage
FROM gallery_images;

-- Grant permissions
GRANT SELECT ON gallery_health_summary TO authenticated;
GRANT EXECUTE ON FUNCTION update_image_health_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_working_image_url TO authenticated;

-- Show the results
SELECT 
  'Migration completed' as status,
  COUNT(*) as total_images,
  COUNT(*) FILTER (WHERE health_status = 'healthy') as healthy_images,
  COUNT(*) FILTER (WHERE health_status = 'error') as error_images
FROM gallery_images;