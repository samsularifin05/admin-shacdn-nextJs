"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Link2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RelationshipConfig } from "../types";

interface RelationshipManagerProps {
  moduleId: number;
  onRelationshipCreated?: () => void;
}

export function RelationshipManager({
  moduleId,
  onRelationshipCreated,
}: RelationshipManagerProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<RelationshipConfig>>({
    sourceModuleId: moduleId,
    relationshipType: "one-to-many",
    targetField: "id",
    cascadeDelete: false,
    required: false,
  });

  useEffect(() => {
    loadModules();
    loadRelationships();
  }, [moduleId]);

  const loadModules = async () => {
    try {
      const response = await fetch("/api/cms/modules");
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Failed to load modules:", error);
    }
  };

  const loadRelationships = async () => {
    try {
      const response = await fetch(
        `/api/cms/relationships?moduleId=${moduleId}`,
      );
      const data = await response.json();
      setRelationships(data);
    } catch (error) {
      console.error("Failed to load relationships:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cms/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          sourceModuleId: moduleId,
          relationshipType: "one-to-many",
          targetField: "id",
          cascadeDelete: false,
          required: false,
        });
        loadRelationships();
        onRelationshipCreated?.();
      }
    } catch (error) {
      console.error("Failed to create relationship:", error);
    }
  };

  const getRelationshipLabel = (rel: any) => {
    const isSource = rel.sourceModuleId === moduleId;
    const relatedModule = isSource ? rel.targetModule : rel.sourceModule;
    const direction = isSource ? "→" : "←";

    return `${rel.sourceField} ${direction} ${relatedModule.name} (${rel.relationshipType})`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relationships</CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 mb-6 p-4 border rounded-lg"
            >
              <div>
                <Label>Target Module</Label>
                <Select
                  value={formData.targetModuleId?.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      targetModuleId: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules
                      .filter((m) => m.id !== moduleId)
                      .map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id.toString()}
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Source Field</Label>
                <Input
                  value={formData.sourceField || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceField: e.target.value })
                  }
                  placeholder="e.g., kategoriId"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Field name in this module that references the target
                </p>
              </div>

              <div>
                <Label>Relationship Type</Label>
                <Select
                  value={formData.relationshipType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, relationshipType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-to-one">One to One</SelectItem>
                    <SelectItem value="one-to-many">One to Many</SelectItem>
                    <SelectItem value="many-to-many">Many to Many</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Field</Label>
                <Input
                  value={formData.targetField || "id"}
                  onChange={(e) =>
                    setFormData({ ...formData, targetField: e.target.value })
                  }
                  placeholder="id"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, required: checked as boolean })
                    }
                  />
                  <Label htmlFor="required">Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cascade"
                    checked={formData.cascadeDelete}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        cascadeDelete: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="cascade">Cascade Delete</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Create Relationship
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {relationships.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No relationships defined yet
              </p>
            ) : (
              relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Link2Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {getRelationshipLabel(rel)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {rel.required && "Required • "}
                        {rel.cascadeDelete && "Cascade Delete"}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
