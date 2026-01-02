import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/page-layout";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const profileMethods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Admin User",
      email: "admin@example.com",
    },
  });

  const passwordMethods = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    console.log("Profile data:", data);
    // Handle profile update
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    console.log("Password data:", data);
    // Handle password update
  };

  return (
    <PageLayout
      title="Settings"
      description="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Separator />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...profileMethods}>
                <form
                  onSubmit={profileMethods.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormInput name="name" label="Name" placeholder="Your name" />
                  <FormInput
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </FormProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...passwordMethods}>
                <form
                  onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormInput
                    name="currentPassword"
                    type="password"
                    label="Current Password"
                  />
                  <FormInput
                    name="newPassword"
                    type="password"
                    label="New Password"
                  />
                  <FormInput
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                  />
                  <Button type="submit">Update Password</Button>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
