import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, FileText, Users, Heart, Tooth, Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md overflow-hidden">
          <CardHeader className="text-center pb-8 relative">
            {/* Animated 404 number */}
            <div className="mx-auto mb-8 w-32 h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-6xl font-bold text-white drop-shadow-lg">404</span>
            </div>
            
            {/* Dental health icons */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Tooth className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>

            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Page introuvable
            </CardTitle>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                UFSBD Section Hérault - Votre santé bucco-dentaire est notre priorité
              </span>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-8">
            {/* URL Display */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">URL demandée :</p>
              <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-lg text-sm font-mono border border-gray-300">
                {location.pathname}
              </code>
            </div>

            {/* Main Action Button */}
            <div className="text-center">
              <Button 
                asChild 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/" className="flex items-center justify-center gap-3">
                  <Home className="h-5 w-5" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>

            {/* Quick Navigation Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300" variant="outline">
                <Link to="/blog" className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Actualités
                </Link>
              </Button>
              
              <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300" variant="outline">
                <Link to="/organigramme" className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Organisation
                </Link>
              </Button>
              
              <Button asChild className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300" variant="outline">
                <Link to="/contact" className="flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Contact
                </Link>
              </Button>
              
              <Button asChild className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300" variant="outline">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                  Accueil
                </Link>
              </Button>
            </div>

            {/* Back Button */}
            <div className="text-center pt-6 border-t border-gray-200">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 mx-auto text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la page précédente
              </Button>
            </div>

            {/* Footer Info */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-400">
                UFSBD Section Hérault • Votre partenaire santé bucco-dentaire
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
