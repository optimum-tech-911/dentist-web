-- Create organigramme table
CREATE TABLE IF NOT EXISTS organigramme (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('president', 'vicePresident', 'secretaire', 'tresorier', 'commission')),
  image_url TEXT,
  description TEXT,
  members TEXT[], -- Array of member names for commissions
  color TEXT DEFAULT 'from-blue-500 to-blue-600',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data
INSERT INTO organigramme (name, title, type, image_url, description, members, color) VALUES
('Dr. Jean Dupont', 'Président', 'president', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', NULL, NULL, 'from-blue-600 to-blue-700'),
('Dr. Marie Martin', 'Vice-Présidente', 'vicePresident', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', NULL, NULL, 'from-cyan-500 to-cyan-600'),
('Pierre Durand', 'Secrétaire Général', 'secretaire', 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face', NULL, NULL, 'from-blue-500 to-blue-600'),
('Sophie Bernard', 'Trésorière', 'tresorier', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', NULL, NULL, 'from-teal-500 to-teal-600'),
('Commission Prévention', 'Commission Prévention', 'commission', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop&crop=center', 'Actions de prévention et sensibilisation', ARRAY['Dr. Alice Moreau', 'Dr. Paul Lefebvre', 'Claire Rousseau'], 'from-green-500 to-green-600'),
('Commission Formation', 'Commission Formation', 'commission', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop&crop=center', 'Programmes de formation professionnelle', ARRAY['Dr. Michel Blanc', 'Dr. Anne Petit', 'Laurent Simon'], 'from-purple-500 to-purple-600'),
('Commission Santé Publique', 'Commission Santé Publique', 'commission', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=center', 'Politiques de santé bucco-dentaire', ARRAY['Dr. Emma Roussel', 'Dr. Thomas Moreau', 'Julie Bertrand'], 'from-red-500 to-red-600');

-- Enable RLS
ALTER TABLE organigramme ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone
CREATE POLICY "Allow read access for everyone" ON organigramme
  FOR SELECT USING (true);

-- Allow insert, update, delete for authenticated users with admin or doctor role
CREATE POLICY "Allow full access for admin/doctor" ON organigramme
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.role = 'doctor')
    )
  );