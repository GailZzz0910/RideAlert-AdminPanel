import React, { useState } from "react";
import { Upload, File, X, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SuperAdminAddRoutes() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Handle file upload
  const handleFiles = (files: FileList) => {
    setError("");
    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      const validTypes = ['.geojson', '.json'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(fileExtension);
    });

    if (validFiles.length !== fileArray.length) {
      setError("Please upload only GeoJSON (.geojson or .json) files.");
      return;
    }

    setUploadedFiles(validFiles);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setError("");
    setSuccess("");
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one GeoJSON file.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`routes_${index}`, file);
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Successfully uploaded ${uploadedFiles.length} route file(s)!`);
      setUploadedFiles([]);
    } catch (err) {
      setError("Failed to upload routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Route className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Routes</h1>
            <p className="text-muted-foreground">Upload GeoJSON files to add new routes to the system</p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Upload Route Files</CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload GeoJSON files containing route information. Multiple files can be uploaded at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label htmlFor="route-files" className="text-foreground">Route Files (GeoJSON)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Drop your GeoJSON files here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <input
                      id="route-files"
                      type="file"
                      accept=".geojson,.json"
                      multiple
                      className="hidden"
                      onChange={handleChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("route-files")?.click()}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground">Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <File className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Format Guidelines */}
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">GeoJSON Format Guidelines:</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <ul className="space-y-1">
                    <li>• Upload files in GeoJSON format (.geojson or .json)</li>
                    <li>• Files should contain LineString or MultiLineString geometries for routes</li>
                    <li>• Use WGS84 coordinate system (EPSG:4326) - standard for OpenStreetMap</li>
                    <li>• Coordinates format: [longitude, latitude] (longitude first)</li>
                    <li>• Include properties like: name, highway, route_ref, public_transport</li>
                    <li>• Maximum file size: 10MB per file</li>
                    <li>• Compatible with OpenStreetMap data exports and editing tools</li>
                  </ul>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-sm text-center">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                    Uploading Routes...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Routes
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}