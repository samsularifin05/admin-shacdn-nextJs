import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/form";
import { useModalStore } from "@/stores/modal-store";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive"]),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => void;
}

export function UserForm({ initialData, onSubmit }: UserFormProps) {
  const { onClose } = useModalStore();
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      role: initialData?.role || "User",
      status: initialData?.status || "Active",
    },
  });

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
        />
        <FormInput
          name="email"
          label="Email Address"
          placeholder="enter@email.com"
          type="email"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            name="role"
            label="Role"
            placeholder="Select role"
            options={roleOptions}
          />
          <FormSelect
            name="status"
            label="Status"
            placeholder="Select status"
            options={statusOptions}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
