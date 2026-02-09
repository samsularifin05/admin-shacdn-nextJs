"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Rocket,
  FileJson,
  Eye,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormBuilder } from "@/modules/cms-builder/components/form-builder";
import { RelationshipManager } from "@/modules/cms-builder/components/relationship-manager";
import { PublishManager } from "@/modules/cms-builder/components/publish-manager";
import { DynamicFormRenderer } from "@/modules/cms-builder/components/dynamic-form-renderer";
import { ModuleConfig } from "@/modules/cms-builder/types";
import Link from "next/link";

export default function CmsBuilderPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<ModuleConfig | null>(null);
  const [activeTab, setActiveTab] = useState<
    "form" | "relationships" | "publish"
  >("form");

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const response = await fetch("/api/cms/modules");
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Failed to load modules:", error);
    }
  };

  const handleSaveModule = async (config: ModuleConfig) => {
    try {
      const url = selectedModule
        ? `/api/cms/modules/${selectedModule.id}`
        : "/api/cms/modules";
      const method = selectedModule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setShowBuilder(false);
        setSelectedModule(null);
        loadModules();
      }
    } catch (error) {
      console.error("Failed to save module:", error);
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      const response = await fetch(`/api/cms/modules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadModules();
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const handleEditModule = async (id: number) => {
    try {
      const response = await fetch(`/api/cms/modules/${id}`);
      const module = await response.json();
      setSelectedModule(module);
      setShowBuilder(true);
    } catch (error) {
      console.error("Failed to load module:", error);
    }
  };

  const filteredModules = modules.filter(
    (module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.resourceName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedModules = {
    master: filteredModules.filter((m) => m.moduleType === "master"),
    transaction: filteredModules.filter((m) => m.moduleType === "transaction"),
    report: filteredModules.filter((m) => m.moduleType === "report"),
    dashboard: filteredModules.filter((m) => m.moduleType === "dashboard"),
  };

  return (
    <ProtectedRoute>
      <PageLayout
        title="CMS Builder"
        description="Build and manage your application modules"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedModule(null);
                setShowBuilder(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Module
            </Button>
          </div>

          {Object.entries(groupedModules).map(([type, modules]) =>
            modules.length > 0 ? (
              <div key={type}>
                <h3 className="text-lg font-semibold mb-3 capitalize">
                  {type === "master" ? "Master Data" : type}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => (
                    <Card
                      key={module.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {module.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.resourceName}
                            </p>
                          </div>
                          <Badge
                            variant={module.published ? "default" : "secondary"}
                            className={module.published ? "bg-green-500" : ""}
                          >
                            {module.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Fields:
                            </span>
                            <span className="font-medium">
                              {module._count?.fields || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Relations:
                            </span>
                            <span className="font-medium">
                              {module._count?.relationships || 0}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditModule(module.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null,
          )}

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Get started by creating your first module"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    setSelectedModule(null);
                    setShowBuilder(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Module Builder Dialog */}
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
            <DialogHeader className="px-6 pt-6">
              <div className="flex items-center gap-4 border-b pb-4">
                <DialogTitle>
                  {selectedModule ? "Edit Module" : "Create Module"}
                </DialogTitle>
                {selectedModule && (
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "form" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("form")}
                    >
                      Form Builder
                    </Button>
                    <Button
                      variant={
                        activeTab === "relationships" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveTab("relationships")}
                    >
                      Relationships
                    </Button>
                    <Button
                      variant={activeTab === "publish" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("publish")}
                    >
                      Publish
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="h-[calc(95vh-100px)] overflow-hidden">
              {activeTab === "form" && (
                <FormBuilder
                  initialConfig={selectedModule}
                  onSave={handleSaveModule}
                  onPreview={(config) => {
                    setPreviewConfig(config);
                    setShowPreview(true);
                  }}
                />
              )}
              {activeTab === "relationships" && selectedModule && (
                <div className="p-6">
                  <RelationshipManager
                    moduleId={selectedModule.id}
                    onRelationshipCreated={() =>
                      handleEditModule(selectedModule.id)
                    }
                  />
                </div>
              )}
              {activeTab === "publish" && selectedModule && (
                <div className="p-6">
                  <PublishManager
                    moduleId={selectedModule.id}
                    module={selectedModule}
                    onPublished={() => {
                      loadModules();
                      handleEditModule(selectedModule.id);
                    }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Form Preview</DialogTitle>
            </DialogHeader>
            {previewConfig && (
              <DynamicFormRenderer
                config={previewConfig}
                onSubmit={(data) => {
                  console.log("Preview form data:", data);
                  alert(
                    "This is a preview. Data: " + JSON.stringify(data, null, 2),
                  );
                }}
                onCancel={() => setShowPreview(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </PageLayout>
    </ProtectedRoute>
  );
}
