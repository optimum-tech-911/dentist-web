import { Link } from 'react-router-dom';
import { ContactForm } from '@/components/ContactForm';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <a href="https://www.ufsbd.fr" target="_blank" rel="noopener noreferrer">
                <img src="/ufsbd-logo-new.jpg" alt="UFSBD Logo" className="h-20 w-auto hover:scale-105 transition-transform cursor-pointer" />
              </a>
            </div>
            <p className="text-blue-200 leading-relaxed">
              Union Française pour la Santé Bucco-Dentaire - Section Hérault
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-300">Contact</h3>
            <div className="space-y-2 text-blue-200">
              <p>📧 Email: ufsbd34@ufsbd.fr</p>
              <p>📍 285 rue Alfred Nobel, 34200 Montpellier</p>
              <p>📞 Téléphone: 06 86 30 62 04</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-300">Liens utiles</h3>
            <div className="space-y-3">
              <div>
                <Link to="/blog" className="text-blue-200 hover:text-yellow-300 transition-colors inline-flex items-center">
                  📰 Actualités
                </Link>
              </div>
              <div>
                <ContactForm isModal trigger={<button className="text-blue-200 hover:text-yellow-300 transition-colors text-left inline-flex items-center">
                      ✉️ Nous contacter
                    </button>} />
              </div>
              <div>
                <a 
                  href="https://www.instagram.com/ufsbd34?igsh=NzR5YWduOHdqazUw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-yellow-300 transition-colors inline-flex items-center"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-800 pt-8 text-center">
          <p className="text-blue-300">
            © 2024 UFSBD Section Hérault. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
} 