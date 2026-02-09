"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/protected-route";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicFormRenderer } from "@/modules/cms-builder/components/dynamic-form-renderer";

export default function DynamicModulePage() {
  const router = useRouter();
  const { resourceName } = router.query;
  const [moduleConfig, setModuleConfig] = useState<any | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    if (resourceName) {
      loadModuleData();
    }
  }, [resourceName]);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dynamic/${resourceName}`);
      const result = await response.json();

      if (result.module) {
        setModuleConfig(result.module);
        setData(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load module data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const method = selectedItem ? "PUT" : "POST";
      const payload = selectedItem
        ? { ...formData, id: selectedItem.id }
        : formData;

      const response = await fetch(`/api/dynamic/${resourceName}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const result = await response.json();
      console.log("Data saved successfully:", result);

      setShowForm(false);
      setSelectedItem(null);
      loadModuleData();
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/dynamic/${resourceName}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      console.log("Data deleted successfully");
      loadModuleData();
    } catch (error) {
      console.error("Failed to delete data:", error);
      alert("Failed to delete data. Please try again.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout title="Loading..." description="">
          <div className="flex items-center justify-center h-64">
            <p>Loading module...</p>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (!moduleConfig) {
    return (
      <ProtectedRoute>
        <PageLayout title="Not Found" description="">
          <Card className="p-6 text-center">
            <p>Module not found or not published</p>
            <Button className="mt-4" asChild>
              <a href="/admin/page-builder">Back to Page Builder</a>
            </Button>
          </Card>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  // Create columns from module fields
  const columns = moduleConfig.fields
    .filter((field: any) => field.showInList)
    .map((field: any) => ({
      accessorKey: field.name,
      header: field.label,
      cell: ({ row }: any) => {
        const value = row.getValue(field.name);

        // Format based on field type
        if (field.type === "currency" || field.type === "rupiah") {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(value || 0);
        }

        if (field.type === "date") {
          return value ? new Date(value).toLocaleDateString() : "-";
        }

        if (field.type === "boolean") {
          return value ? (
            <Badge className="bg-green-500">Yes</Badge>
          ) : (
            <Badge variant="secondary">No</Badge>
          );
        }

        return value || "-";
      },
    }));

  // Add actions column
  columns.push({
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedItem(row.original);
            setShowForm(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  });

  return (
    <ProtectedRoute>
      <PageLayout
        title={moduleConfig.title}
        description={`Manage ${moduleConfig.title}`}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setSelectedItem(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {moduleConfig.name}
            </Button>
          </div>

          <Card>
            <DataTable
              columns={columns}
              data={data}
              searchPlaceholder={`Search ${moduleConfig.title}...`}
            />
          </Card>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Edit" : "Add"} {moduleConfig.name}
              </DialogTitle>
            </DialogHeader>
            <DynamicFormRenderer
              config={{
                ...moduleConfig,
                fields: moduleConfig.fields.filter((f: any) => f.showInForm),
              }}
              initialData={selectedItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedItem(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageLayout>
    </ProtectedRoute>
  );
}
