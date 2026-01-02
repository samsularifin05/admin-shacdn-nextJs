import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

interface PanelAdminProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const PanelAdmin = ({
  title,
  description,
  children,
}: PanelAdminProps) => {
  return (
    <div className="space-y-3">
      <Card>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};

export default PanelAdmin;
