"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Rocket,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModuleConfig } from "../types";

interface PublishManagerProps {
  moduleId: number;
  module?: ModuleConfig;
  onPublished?: () => void;
}

export function PublishManager({
  moduleId,
  module,
  onPublished,
}: PublishManagerProps) {
  const [isPublished, setIsPublished] = useState(module?.published || false);
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState({
    hasFields: false,
    hasRoute: false,
    hasValidation: false,
    hasRelationships: false,
  });

  useEffect(() => {
    if (module) {
      setIsPublished(module.published || false);
      setChecklist({
        hasFields: (module.fields?.length || 0) > 0,
        hasRoute: !!module.route,
        hasValidation: module.fields?.some((f) => f.required) || false,
        hasRelationships: true, // Will be checked from API
      });
    }
  }, [module]);

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms/modules/${moduleId}/publish`, {
        method: "POST",
      });

      if (response.ok) {
        setIsPublished(true);
        alert("Module published and scaffold generated successfully!");
        onPublished?.();
      }
    } catch (error) {
      console.error("Failed to publish module:", error);
      alert("Failed to publish module");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms/modules/${moduleId}/publish`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsPublished(false);
        onPublished?.();
      }
    } catch (error) {
      console.error("Failed to unpublish module:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToFormJson = async () => {
    try {
      const response = await fetch(`/api/cms/modules/${moduleId}/export`);
      const json = await response.json();

      // Download as JSON file
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${json.resourceName}.json`;
      a.click();
    } catch (error) {
      console.error("Failed to export module:", error);
    }
  };

  const handleGenerateScaffold = async () => {
    try {
      // First export to formJson
      const response = await fetch(`/api/cms/modules/${moduleId}/export`);
      const json = await response.json();

      // Call scaffold generator API (you'll need to create this)
      const scaffoldResponse = await fetch("/api/cms/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (scaffoldResponse.ok) {
        alert("Module scaffolding generated successfully!");
      }
    } catch (error) {
      console.error("Failed to generate scaffold:", error);
    }
  };

  const allChecksPass = Object.values(checklist).every((v) => v);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Publish Module</span>
          {isPublished ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Circle className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Pre-publish Checklist</h4>
          <div className="space-y-2">
            <ChecklistItem
              checked={checklist.hasFields}
              label="Has at least one field"
            />
            <ChecklistItem
              checked={checklist.hasRoute}
              label="Route is defined"
            />
            <ChecklistItem
              checked={checklist.hasValidation}
              label="Has field validation"
            />
            <ChecklistItem
              checked={checklist.hasRelationships}
              label="Relationships configured (if needed)"
            />
          </div>
        </div>

        {!allChecksPass && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Complete the checklist before publishing
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!isPublished ? (
            <Button
              onClick={handlePublish}
              disabled={!allChecksPass || isLoading}
              className="w-full"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Publish Module
            </Button>
          ) : (
            <Button
              onClick={handleUnpublish}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              Unpublish Module
            </Button>
          )}

          <Button
            onClick={handleExportToFormJson}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to FormJSON
          </Button>
        </div>

        {isPublished && module?.publishedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Published on {new Date(module.publishedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4 text-gray-300" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}
