import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Table as TableIcon, Plus, Minus, Settings, Copy, Trash2 } from 'lucide-react';

interface TableTemplate {
  name: string;
  description: string;
  rows: number;
  cols: number;
  headers: string[];
  data: string[][];
}

interface TableBuilderProps {
  onInsertTable: (tableData: { rows: number; cols: number; headers: string[]; data: string[][] }) => void;
  trigger?: React.ReactNode;
}

const tableTemplates: TableTemplate[] = [
  {
    name: "Comparaison de produits",
    description: "Tableau pour comparer différents produits ou services",
    rows: 4,
    cols: 4,
    headers: ["Produit", "Prix", "Caractéristiques", "Note"],
    data: [
      ["Produit A", "€XX", "Caractéristique 1", "4.5/5"],
      ["Produit B", "€XX", "Caractéristique 2", "4.0/5"],
      ["Produit C", "€XX", "Caractéristique 3", "4.8/5"]
    ]
  },
  {
    name: "Planning hebdomadaire",
    description: "Tableau pour organiser un planning sur 7 jours",
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
    ]
  },
  {
    name: "Données statistiques",
    description: "Tableau pour présenter des données numériques",
    rows: 5,
    cols: 4,
    headers: ["Année", "Ventes", "Croissance", "Part de marché"],
    data: [
      ["2021", "1000", "+5%", "15%"],
      ["2022", "1200", "+20%", "18%"],
      ["2023", "1400", "+17%", "22%"],
      ["2024", "1600", "+14%", "25%"]
    ]
  },
  {
    name: "Liste de contacts",
    description: "Tableau pour organiser des informations de contact",
    rows: 6,
    cols: 4,
    headers: ["Nom", "Email", "Téléphone", "Rôle"],
    data: [
      ["Jean Dupont", "jean@example.com", "01 23 45 67 89", "Manager"],
      ["Marie Martin", "marie@example.com", "01 23 45 67 90", "Développeur"],
      ["Pierre Durand", "pierre@example.com", "01 23 45 67 91", "Designer"],
      ["Sophie Bernard", "sophie@example.com", "01 23 45 67 92", "Marketing"],
      ["Lucas Petit", "lucas@example.com", "01 23 45 67 93", "Ventes"]
    ]
  },
  {
    name: "Tableau vide personnalisé",
    description: "Créez votre propre tableau à partir de zéro",
    rows: 3,
    cols: 3,
    headers: ["Colonne 1", "Colonne 2", "Colonne 3"],
    data: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ]
  }
];

export const TableBuilder: React.FC<TableBuilderProps> = ({ onInsertTable, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TableTemplate | null>(null);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un tableau</DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          // Template Selection View
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Choisissez un modèle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableTemplates.map((template, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {template.rows} lignes × {template.cols} colonnes
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Ou créez un tableau personnalisé</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rows">Lignes:</Label>
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
                  <Label htmlFor="cols">Colonnes:</Label>
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
                <Button onClick={handleCustomTable}>Créer</Button>
              </div>
            </div>
          </div>
        ) : (
          // Table Editing View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedTemplate ? `Modifier: ${selectedTemplate.name}` : 'Tableau personnalisé'}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetTable}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
                <Button size="sm" onClick={insertTable}>
                  Insérer le tableau
                </Button>
              </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ligne
                </Button>
                <Button variant="outline" size="sm" onClick={removeRow} disabled={tableData.length <= 1}>
                  <Minus className="h-4 w-4 mr-1" />
                  Ligne
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addColumn}>
                  <Plus className="h-4 w-4 mr-1" />
                  Colonne
                </Button>
                <Button variant="outline" size="sm" onClick={removeColumn} disabled={headers.length <= 1}>
                  <Minus className="h-4 w-4 mr-1" />
                  Colonne
                </Button>
              </div>
            </div>

            {/* Editable Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, colIndex) => (
                      <TableHead key={colIndex} className="p-2">
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(colIndex, e.target.value)}
                          className="border-0 p-1 text-sm font-medium bg-transparent"
                          placeholder={`Colonne ${colIndex + 1}`}
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <TableCell key={colIndex} className="p-2">
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="border-0 p-1 text-sm bg-transparent"
                            placeholder="Contenu..."
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 