"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Layout, Grid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PageBuilderPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const response = await fetch("/api/cms/modules?published=true");
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Failed to load modules:", error);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout
        title="Page Builder"
        description="Create custom pages with drag-and-drop components"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Published Modules</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Page
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Card
                key={module.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        /{module.resourceName}
                      </p>
                    </div>
                    <Badge className="bg-green-500">Published</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a href={`/admin/dynamic/${module.resourceName}`}>
                          <List className="h-3 w-3 mr-1" />
                          View List
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a href={`/admin/dynamic/${module.resourceName}/form`}>
                          <Layout className="h-3 w-3 mr-1" />
                          Form
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {module.fields?.length || 0} fields •{" "}
                      {module._count?.relationships || 0} relations
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {modules.length === 0 && (
            <div className="text-center py-12">
              <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No published modules</h3>
              <p className="text-muted-foreground mb-4">
                Publish modules from the Module Builder to see them here
              </p>
              <Button asChild>
                <a href="/admin/cms-builder">Go to Module Builder</a>
              </Button>
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
