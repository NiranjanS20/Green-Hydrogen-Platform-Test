'use client';

import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  DateRangePicker,
  Progress,
  Card,
  CardBody,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@heroui/react';
import {
  Download,
  Upload,
  FileText,
  Database,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ExportOptions, ImportResult, DatabaseTables } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DataExportImportProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'export' | 'import';
}

export function DataExportImport({ 
  isOpen, 
  onClose, 
  defaultTab = 'export' 
}: DataExportImportProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    tables: ['production_facilities'],
    includeMetadata: false,
    compression: false,
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTables: { key: DatabaseTables; label: string; description: string }[] = [
    {
      key: 'production_facilities',
      label: 'Production Facilities',
      description: 'Hydrogen production facilities and their configurations'
    },
    {
      key: 'storage_facilities',
      label: 'Storage Facilities',
      description: 'Storage tanks and their current status'
    },
    {
      key: 'transport_routes',
      label: 'Transport Routes',
      description: 'Transportation routes and delivery information'
    },
    {
      key: 'renewable_sources',
      label: 'Renewable Sources',
      description: 'Solar, wind, and hydro energy sources'
    },
    {
      key: 'research_papers',
      label: 'Research Papers',
      description: 'Research publications and documents'
    },
    {
      key: 'system_metrics',
      label: 'System Metrics',
      description: 'Performance metrics and analytics data'
    },
  ];

  const exportFormats = [
    { key: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { key: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
    { key: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { key: 'pdf', label: 'PDF', description: 'Portable Document Format' },
  ];

  const handleExport = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Fetch data from API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);

      // Process and download data based on format
      await downloadData(data, exportOptions.format);

      toast.success('Data exported successfully');
      onClose();

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadData = async (data: any, format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `hydrogen-platform-export-${timestamp}`;

    switch (format) {
      case 'csv':
        downloadCSV(data, filename);
        break;
      case 'xlsx':
        downloadExcel(data, filename);
        break;
      case 'json':
        downloadJSON(data, filename);
        break;
      case 'pdf':
        await downloadPDF(data, filename);
        break;
    }
  };

  const downloadCSV = (data: any, filename: string) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const downloadExcel = (data: any, filename: string) => {
    const workbook = XLSX.utils.book_new();
    
    // Create separate sheets for each table
    Object.entries(data).forEach(([tableName, tableData]: [string, any]) => {
      if (Array.isArray(tableData) && tableData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(tableData);
        XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
      }
    });

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const downloadPDF = async (data: any, filename: string) => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('Green Hydrogen Platform Export', 20, 20);
    
    // Add metadata
    pdf.setFontSize(12);
    pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);
    pdf.text(`Date Range: ${exportOptions.dateRange.start} to ${exportOptions.dateRange.end}`, 20, 45);
    
    let yPosition = 60;
    
    // Add data for each table
    Object.entries(data).forEach(([tableName, tableData]: [string, any]) => {
      if (Array.isArray(tableData) && tableData.length > 0) {
        // Add table title
        pdf.setFontSize(14);
        pdf.text(tableName.replace(/_/g, ' ').toUpperCase(), 20, yPosition);
        yPosition += 10;
        
        // Prepare table data
        const headers = Object.keys(tableData[0]);
        const rows = tableData.map((item: any) => headers.map(header => item[header] || ''));
        
        // Add table
        (pdf as any).autoTable({
          head: [headers],
          body: rows,
          startY: yPosition,
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
        
        yPosition = (pdf as any).lastAutoTable.finalY + 20;
        
        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      }
    });
    
    pdf.save(`${filename}.pdf`);
  };

  const convertToCSV = (data: any): string => {
    let csvContent = '';
    
    Object.entries(data).forEach(([tableName, tableData]: [string, any]) => {
      if (Array.isArray(tableData) && tableData.length > 0) {
        csvContent += `\n\n${tableName.toUpperCase()}\n`;
        
        // Headers
        const headers = Object.keys(tableData[0]);
        csvContent += headers.join(',') + '\n';
        
        // Data rows
        tableData.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          });
          csvContent += values.join(',') + '\n';
        });
      }
    });
    
    return csvContent;
  };

  const handleImport = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify({ validateData: true }));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result: ImportResult = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);

      if (result.success) {
        toast.success(`Successfully imported ${result.recordsImported} records`);
      } else {
        toast.error(`Import completed with ${result.errors.length} errors`);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </div>
        </ModalHeader>
        
        <ModalBody>
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as 'export' | 'import')}
            className="w-full"
          >
            {/* Export Tab */}
            <Tab key="export" title={
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </div>
            }>
              <div className="space-y-6">
                {/* Export Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">Export Format</label>
                  <Select
                    selectedKeys={[exportOptions.format]}
                    onSelectionChange={(keys) => {
                      const format = Array.from(keys)[0] as ExportOptions['format'];
                      setExportOptions(prev => ({ ...prev, format }));
                    }}
                  >
                    {exportFormats.map((format) => (
                      <SelectItem key={format.key}>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exportOptions.dateRange.start}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exportOptions.dateRange.end}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Tables Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Select Data Tables
                  </label>
                  <CheckboxGroup
                    value={exportOptions.tables}
                    onValueChange={(tables) => setExportOptions(prev => ({ 
                      ...prev, 
                      tables: tables as DatabaseTables[] 
                    }))}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {availableTables.map((table) => (
                        <Card key={table.key} className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox value={table.key} />
                            <div className="flex-1">
                              <div className="font-medium">{table.label}</div>
                              <div className="text-xs text-gray-500">{table.description}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CheckboxGroup>
                </div>

                {/* Export Options */}
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Options</label>
                  <div className="space-y-3">
                    <Checkbox
                      isSelected={exportOptions.includeMetadata}
                      onValueChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeMetadata: checked 
                      }))}
                    >
                      Include metadata and system information
                    </Checkbox>
                    <Checkbox
                      isSelected={exportOptions.compression}
                      onValueChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        compression: checked 
                      }))}
                    >
                      Compress export file (ZIP format)
                    </Checkbox>
                  </div>
                </div>

                {/* Progress */}
                {isProcessing && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Exporting data...</span>
                      <span className="text-sm">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </div>
            </Tab>

            {/* Import Tab */}
            <Tab key="import" title={
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </div>
            }>
              <div className="space-y-6">
                {/* File Upload */}
                <Card>
                  <CardBody className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-blue-50 rounded-full">
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Upload Data File</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Supported formats: CSV, Excel (.xlsx), JSON
                        </p>
                        <Button
                          onPress={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                        >
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.json"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Import Progress */}
                {isProcessing && (
                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Processing import...</span>
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </CardBody>
                  </Card>
                )}

                {/* Import Results */}
                {importResult && (
                  <Card>
                    <CardBody>
                      <div className="flex items-center gap-2 mb-4">
                        {importResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                        <h3 className="font-medium">Import Results</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">
                            {importResult.recordsProcessed}
                          </div>
                          <div className="text-xs text-gray-500">Processed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {importResult.recordsImported}
                          </div>
                          <div className="text-xs text-gray-500">Imported</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">
                            {importResult.errors.length}
                          </div>
                          <div className="text-xs text-gray-500">Errors</div>
                        </div>
                      </div>

                      {importResult.errors.length > 0 && (
                        <div>
                          <Divider className="my-4" />
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <X className="h-4 w-4 text-red-500" />
                            Import Errors
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <div key={index} className="text-sm bg-red-50 p-2 rounded">
                                <div className="font-medium">Row {error.row}</div>
                                <div className="text-red-600">{error.message}</div>
                                {error.field && (
                                  <div className="text-xs text-gray-500">
                                    Field: {error.field}, Value: {String(error.value)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {importResult.warnings.length > 0 && (
                        <div>
                          <Divider className="my-4" />
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Warnings
                          </h4>
                          <div className="space-y-1">
                            {importResult.warnings.map((warning, index) => (
                              <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                {warning}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Import Guidelines */}
                <Card>
                  <CardBody>
                    <h4 className="font-medium mb-2">Import Guidelines</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ensure your data follows the correct column structure</li>
                      <li>• Required fields must not be empty</li>
                      <li>• Dates should be in YYYY-MM-DD format</li>
                      <li>• Numeric values should not contain special characters</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Duplicate records will be skipped</li>
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
          {activeTab === 'export' && (
            <Button 
              color="primary" 
              onPress={handleExport}
              isLoading={isProcessing}
              disabled={exportOptions.tables.length === 0}
            >
              Export Data
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
