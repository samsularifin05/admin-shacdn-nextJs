import { GetServerSideProps } from "next";
import { PageLayout } from "@/components/page-layout";
import { UserTable } from "@/modules/users/components/user-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";
import { userServerLogic } from "@/modules/users/server/user.server";
import { User } from "@/modules/users/types/user.schema";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "r4h4s14_su93r_s3kr3t";

interface UsersPageProps {
  initialData: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UsersPage({ initialData, meta }: UsersPageProps) {
  return (
    <PageLayout
      title="Users"
      description="Manage your users and their permissions"
    >
      <PanelAdmin
        title="All Users"
        description="A list of all users in your account with sorting and pagination"
      >
        <UserTable initialData={initialData} meta={meta} />
      </PanelAdmin>
    </PageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  // 1. SECURITY: Block direct address bar navigation to .json data
  const fetchMode = req.headers["sec-fetch-mode"];
  const isDataRequest = req.url?.includes("_next/data");

  if (fetchMode === "navigate" && isDataRequest) {
    context.res.writeHead(307, { Location: "/" });
    context.res.end();
    return { props: {} as any };
  }

  // 2. SECURITY: Verify JWT Token from Cookie (Prevents Postman & Unauthorized access)
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  try {
    // Verify the token validity
    jwt.verify(token, JWT_SECRET);

    // 3. Fetch data if authenticated
    const page = Number(context.query.page) || 1;
    const limit = Number(context.query.limit) || 10;
    const search = (context.query.search as string) || undefined;

    const result = await userServerLogic.getPaginatedUsers(page, limit, search);

    return {
      props: {
        initialData: result.users,
        meta: result.meta,
      },
    };
  } catch (error) {
    // If token invalid, redirect to login
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
};
