import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table as TableIcon, 
  Plus, 
  Minus, 
  Settings, 
  Copy, 
  Trash2, 
  Grid3X3, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface TableTemplate {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  rows: number;
  cols: number;
  headers: string[];
  data: string[][];
  color: string;
}

interface TableBuilderProps {
  onInsertTable: (tableData: { rows: number; cols: number; headers: string[]; data: string[][] }) => void;
  trigger?: React.ReactNode;
}

const tableTemplates: TableTemplate[] = [
  {
    name: "Comparaison de produits",
    description: "Comparez différents produits ou services avec leurs caractéristiques",
    icon: Grid3X3,
    category: "Business",
    rows: 4,
    cols: 4,
    headers: ["Produit", "Prix", "Caractéristiques", "Note"],
    data: [
      ["Produit A", "€XX", "Caractéristique 1", "4.5/5"],
      ["Produit B", "€XX", "Caractéristique 2", "4.0/5"],
      ["Produit C", "€XX", "Caractéristique 3", "4.8/5"]
    ],
    color: "border-blue-500 bg-blue-50"
  },
  {
    name: "Planning hebdomadaire",
    description: "Organisez votre planning sur 7 jours avec des créneaux horaires",
    icon: Calendar,
    category: "Planning",
    rows: 8,
    cols: 8,
    headers: ["Heure", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    data: [
      ["8h-10h", "", "", "", "", "", "", ""],
      ["10h-12h", "", "", "", "", "", "", ""],
      ["12h-14h", "", "", "", "", "", "", ""],
      ["14h-16h", "", "", "", "", "", "", ""],
      ["16h-18h", "", "", "", "", "", "", ""],
      ["18h-20h", "", "", "", "", "", "", ""],
      ["20h-22h", "", "", "", "", "", "", ""]
    ],
    color: "border-green-500 bg-green-50"
  },
  {
    name: "Données statistiques",
    description: "Présentez vos données numériques et analyses de manière claire",
    icon: BarChart3,
    category: "Analytics",
    rows: 5,
    cols: 4,
    headers: ["Année", "Ventes", "Croissance", "Part de marché"],
    data: [
      ["2021", "1000", "+5%", "15%"],
      ["2022", "1200", "+20%", "18%"],
      ["2023", "1400", "+17%", "22%"],
      ["2024", "1600", "+14%", "25%"]
    ],
    color: "border-orange-500 bg-orange-50"
  },
  {
    name: "Liste de contacts",
    description: "Organisez vos informations de contact et équipe",
    icon: Users,
    category: "Contacts",
    rows: 6,
    cols: 4,
    headers: ["Nom", "Email", "Téléphone", "Rôle"],
    data: [
      ["Jean Dupont", "jean@example.com", "01 23 45 67 89", "Manager"],
      ["Marie Martin", "marie@example.com", "01 23 45 67 90", "Développeur"],
      ["Pierre Durand", "pierre@example.com", "01 23 45 67 91", "Designer"],
      ["Sophie Bernard", "sophie@example.com", "01 23 45 67 92", "Marketing"],
      ["Lucas Petit", "lucas@example.com", "01 23 45 67 93", "Ventes"]
    ],
    color: "border-purple-500 bg-purple-50"
  },
  {
    name: "Prix et services",
    description: "Affichez vos tarifs et services de manière professionnelle",
    icon: DollarSign,
    category: "Business",
    rows: 4,
    cols: 3,
    headers: ["Service", "Prix", "Description"],
    data: [
      ["Consultation", "€50", "Première consultation"],
      ["Traitement", "€150", "Traitement complet"],
      ["Suivi", "€30", "Consultation de suivi"]
    ],
    color: "border-emerald-500 bg-emerald-50"
  },
  {
    name: "Horaires d'ouverture",
    description: "Présentez vos horaires d'ouverture de manière claire",
    icon: Clock,
    category: "Planning",
    rows: 7,
    cols: 2,
    headers: ["Jour", "Horaires"],
    data: [
      ["Lundi", "9h-18h"],
      ["Mardi", "9h-18h"],
      ["Mercredi", "9h-18h"],
      ["Jeudi", "9h-18h"],
      ["Vendredi", "9h-18h"],
      ["Samedi", "9h-12h"],
      ["Dimanche", "Fermé"]
    ],
    color: "border-cyan-500 bg-cyan-50"
  },
  {
    name: "Évaluation et avis",
    description: "Collectez et affichez les avis de vos clients",
    icon: Star,
    category: "Feedback",
    rows: 5,
    cols: 4,
    headers: ["Client", "Note", "Avis", "Date"],
    data: [
      ["Marie L.", "5/5", "Excellent service", "2024-01-15"],
      ["Pierre D.", "4/5", "Très satisfait", "2024-01-10"],
      ["Sophie M.", "5/5", "Recommandé", "2024-01-08"],
      ["Jean P.", "4/5", "Bon rapport qualité", "2024-01-05"]
    ],
    color: "border-yellow-500 bg-yellow-50"
  },
  {
    name: "Tableau vide personnalisé",
    description: "Créez votre propre tableau à partir de zéro",
    icon: FileText,
    category: "Custom",
    rows: 3,
    cols: 3,
    headers: ["Colonne 1", "Colonne 2", "Colonne 3"],
    data: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ],
    color: "border-gray-500 bg-gray-50"
  }
];

const categories = [
  { name: "Tous", icon: Grid3X3 },
  { name: "Business", icon: DollarSign },
  { name: "Planning", icon: Calendar },
  { name: "Analytics", icon: BarChart3 },
  { name: "Contacts", icon: Users },
  { name: "Feedback", icon: Star },
  { name: "Custom", icon: FileText }
];

export const TableBuilder: React.FC<TableBuilderProps> = ({ onInsertTable, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TableTemplate | null>(null);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredTemplates = selectedCategory === "Tous" 
    ? tableTemplates 
    : tableTemplates.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (template: TableTemplate) => {
    setSelectedTemplate(template);
    setTableData([...template.data]);
    setHeaders([...template.headers]);
    setCustomRows(template.rows);
    setCustomCols(template.cols);
    setIsEditing(true);
  };

  const handleCustomTable = () => {
    const newHeaders = Array.from({ length: customCols }, (_, i) => `Colonne ${i + 1}`);
    const newData = Array.from({ length: customRows }, () => 
      Array.from({ length: customCols }, () => '')
    );
    setHeaders(newHeaders);
    setTableData(newData);
    setSelectedTemplate(null);
    setIsEditing(true);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const addRow = () => {
    const newRow = Array.from({ length: customCols }, () => '');
    setTableData([...tableData, newRow]);
    setCustomRows(customRows + 1);
  };

  const removeRow = () => {
    if (tableData.length > 1) {
      const newData = tableData.slice(0, -1);
      setTableData(newData);
      setCustomRows(customRows - 1);
    }
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Colonne ${headers.length + 1}`];
    const newData = tableData.map(row => [...row, '']);
    setHeaders(newHeaders);
    setTableData(newData);
    setCustomCols(customCols + 1);
  };

  const removeColumn = () => {
    if (headers.length > 1) {
      const newHeaders = headers.slice(0, -1);
      const newData = tableData.map(row => row.slice(0, -1));
      setHeaders(newHeaders);
      setTableData(newData);
      setCustomCols(customCols - 1);
    }
  };

  const insertTable = () => {
    onInsertTable({
      rows: tableData.length,
      cols: headers.length,
      headers,
      data: tableData
    });
    setIsOpen(false);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const resetTable = () => {
    setTableData([]);
    setHeaders([]);
    setCustomRows(3);
    setCustomCols(3);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Tableau</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Créer un tableau professionnel
          </DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          // Template Selection View
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Filtrer par catégorie</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Templates Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Modèles de tableaux ({filteredTemplates.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 ${template.color}`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${template.color.replace('border-', 'bg-').replace('500', '100')}`}>
                          <template.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{template.rows} lignes × {template.cols} colonnes</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Prêt à utiliser
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Custom Table Creation */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Créer un tableau personnalisé
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rows" className="text-sm font-medium">Lignes:</Label>
                  <Input
                    id="rows"
                    type="number"
                    min={1}
                    max={20}
                    value={customRows}
                    onChange={(e) => setCustomRows(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="cols" className="text-sm font-medium">Colonnes:</Label>
                  <Input
                    id="cols"
                    type="number"
                    min={1}
                    max={10}
                    value={customCols}
                    onChange={(e) => setCustomCols(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={handleCustomTable} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un tableau vide
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <Info className="h-4 w-4 inline mr-1" />
                Vous pourrez personnaliser les en-têtes et le contenu après création
              </p>
            </div>
          </div>
        ) : (
          // Table Editing View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {selectedTemplate ? `Modifier: ${selectedTemplate.name}` : 'Tableau personnalisé'}
                </h3>
                {selectedTemplate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetTable} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Réinitialiser
                </Button>
                <Button size="sm" onClick={insertTable} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Insérer le tableau
                </Button>
              </div>
            </div>

            {/* Table Controls */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Outils de modification
              </h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une ligne
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeRow} disabled={tableData.length <= 1} className="gap-2">
                    <Minus className="h-4 w-4" />
                    Supprimer une ligne
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={addColumn} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter une colonne
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeColumn} disabled={headers.length <= 1} className="gap-2">
                    <Minus className="h-4 w-4" />
                    Supprimer une colonne
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Cliquez sur les cellules pour modifier leur contenu
              </p>
            </div>

            {/* Editable Table */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-sm">Aperçu du tableau</h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {headers.map((header, colIndex) => (
                      <TableHead key={colIndex} className="p-2">
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(colIndex, e.target.value)}
                          className="border-0 p-2 text-sm font-medium bg-transparent hover:bg-white focus:bg-white transition-colors"
                          placeholder={`Colonne ${colIndex + 1}`}
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, colIndex) => (
                        <TableCell key={colIndex} className="p-2">
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="border-0 p-2 text-sm bg-transparent hover:bg-white focus:bg-white transition-colors"
                            placeholder="Contenu..."
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Table Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Info className="h-4 w-4" />
                <span className="font-medium">Informations du tableau:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-blue-600">Lignes:</span> {tableData.length}
                </div>
                <div>
                  <span className="text-blue-600">Colonnes:</span> {headers.length}
                </div>
                <div>
                  <span className="text-blue-600">Cellules:</span> {tableData.length * headers.length}
                </div>
                <div>
                  <span className="text-blue-600">En-têtes:</span> {headers.filter(h => h.trim()).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 