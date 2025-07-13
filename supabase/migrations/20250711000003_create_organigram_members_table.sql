-- Create organigram_members table
CREATE TABLE IF NOT EXISTS public.organigram_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    image_id UUID REFERENCES public.gallery_images(id) ON DELETE SET NULL,
    description TEXT,
    members TEXT[], -- Array of member names for commissions
    color TEXT DEFAULT 'from-blue-500 to-blue-600',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organigram_members_role ON public.organigram_members(role);
CREATE INDEX IF NOT EXISTS idx_organigram_members_order ON public.organigram_members(order_index);
CREATE INDEX IF NOT EXISTS idx_organigram_members_active ON public.organigram_members(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.organigram_members ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view organigram members
CREATE POLICY "Allow authenticated users to view organigram members" ON public.organigram_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow any authenticated user to insert organigram members
CREATE POLICY "Allow authenticated users to insert organigram members" ON public.organigram_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to update organigram members
CREATE POLICY "Allow authenticated users to update organigram members" ON public.organigram_members
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow any authenticated user to delete organigram members
CREATE POLICY "Allow authenticated users to delete organigram members" ON public.organigram_members
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organigram_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organigram_members_updated_at 
    BEFORE UPDATE ON public.organigram_members 
    FOR EACH ROW EXECUTE FUNCTION update_organigram_members_updated_at();

-- Insert default organigram data
INSERT INTO public.organigram_members (name, title, role, description, members, color, order_index) VALUES
('Dr Amélie Cherbonneau & Dr Abdessamed Abdessadok', 'Co-présidents', 'president', NULL, NULL, 'from-blue-600 to-blue-700', 1),
('Dr Hélène Sabatier', 'Secrétaire générale', 'secretaire', NULL, NULL, 'from-blue-500 to-blue-600', 2),
('Dr Alexandre Yèche', 'Secrétaire général adjoint', 'secretaireAdjoint', NULL, NULL, 'from-cyan-500 to-cyan-600', 3),
('Dr Pascal Rouzeyre', 'Trésorier', 'tresorier', NULL, NULL, 'from-teal-500 to-teal-600', 4),
('Dr Vincent Tiers', 'Trésorier adjoint', 'tresorierAdjoint', NULL, NULL, 'from-green-500 to-green-600', 5),
('Vice-présidents', 'Vice-présidents', 'vicePresidents', 'Dr Aline Rouyre, Dr Delphine Gautier, Dr Cédric Bourgeois, Mr Adam Bouanfir (étudiant)', NULL, 'from-purple-500 to-purple-600', 6),
('Chargés de mission', 'Chargés de mission', 'chargesMission', 'Dr Roselyne Trouche, Dr Meriem Ksibi, Dr Patrice Giammateï', NULL, 'from-red-500 to-red-600', 7),
('Dr Pascale Casanova', 'Vérificateur aux comptes', 'verificateur', NULL, NULL, 'from-orange-500 to-orange-600', 8)
ON CONFLICT DO NOTHING; 