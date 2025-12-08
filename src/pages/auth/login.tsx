import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/auth-store";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/form";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/seo";
import { PublicRoute } from "@/components/public-route";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      const from = (router.query.from as string) || "/dashboard";
      router.replace(from);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <PublicRoute>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <SEO
          title="Sign In - Shadcn Admin"
          description="Login to your admin dashboard account."
        />
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormInput
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  autoComplete="email"
                />

                <FormInput
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign in
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  );
}
