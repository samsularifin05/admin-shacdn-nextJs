import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { PageLayout } from "@/components/page-layout";

export default function DashboardPage() {
  console.log("Rendering DashboardPage");
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
    },
    {
      title: "Subscriptions",
      value: "+2,350",
      change: "+180.1% from last month",
      icon: Users,
    },
    {
      title: "Sales",
      value: "+12,234",
      change: "+19% from last month",
      icon: CreditCard,
    },
    {
      title: "Active Now",
      value: "+573",
      change: "+201 since last hour",
      icon: Activity,
    },
  ];

  return (
    <PageLayout
      title="Dashboard"
      description="Welcome back! Here's an overview of your account."
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Your performance metrics for this month
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Chart placeholder - Add your preferred chart library
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Activity {i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Description of activity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
