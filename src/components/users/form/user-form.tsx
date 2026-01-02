import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/form";
import { useModalStore } from "@/stores/modal-store";
import { UserFormData, userSchema, User } from "../dto/user.schema";
import { userService } from "../services/user.service";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UserFormProps {
  initialData?: User; // Using full User type to get the ID for updates
  onSuccess?: () => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const { onClose } = useModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "User",
      status: initialData?.status || "Active",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // PUT: Update existing user
        await userService.updateUser(initialData.id, data);
      } else {
        // POST: Create new user
        await userService.createUser(data);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { label: "Admin", value: "Admin" },
    { label: "User", value: "User" },
    { label: "Editor", value: "Editor" },
    { label: "Viewer", value: "Viewer" },
  ];

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="name"
          label="Full Name"
          placeholder="Enter full name"
          disabled={isSubmitting}
        />
        <FormInput
          name="email"
          label="Email Address"
          placeholder="enter@email.com"
          type="email"
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            name="role"
            label="Role"
            placeholder="Select role"
            options={roleOptions}
            disabled={isSubmitting}
          />
          <FormSelect
            name="status"
            label="Status"
            placeholder="Select status"
            options={statusOptions}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
