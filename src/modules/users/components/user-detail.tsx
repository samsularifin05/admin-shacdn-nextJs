import { User } from "../types/user.schema";
import { Badge } from "@/components/ui/badge";

interface UserDetailProps {
  user: User;
}

export const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-sm font-semibold">{user.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <div>
            <Badge variant={user.status === "Active" ? "default" : "secondary"}>
              {user.status}
            </Badge>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Email Address
          </p>
          <p className="text-sm">{user.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Role</p>
          <p className="text-sm capitalize">{user.role}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          User profile details are managed by the administrator. Any changes to
          the user s role or status will be reflected across the system
          immediately.
        </p>
      </div>
    </div>
  );
};
