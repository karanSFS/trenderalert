"use client";

import {
  ArrowRightOutlined,
  CheckCircleFilled,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import styled from "styled-components";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { clearSignInError, signIn } from "@/features/auth/authSlice";
import { selectAuth } from "@/features/auth/authSelectors";
import { ADMIN_HOME_PATH } from "@/lib/constants/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SignInCredentials } from "@/types/auth";

const Page = styled.div`
  display: grid;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};

  @media ${({ theme }) => theme.breakpoints.lg} {
    grid-template-columns: minmax(360px, 5fr) 7fr;
  }
`;

const BrandPanel = styled.aside`
  display: none;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space(12)};
  background: ${({ theme }) => theme.colors.sidebarBackground};
  color: ${({ theme }) => theme.colors.sidebarText};

  @media ${({ theme }) => theme.breakpoints.lg} {
    display: flex;
  }

  h2 {
    margin: ${({ theme }) => theme.space(10)} 0 ${({ theme }) => theme.space(4)};
    color: #ffffff;
    font-size: 34px;
    line-height: 1.15;
  }

  p {
    max-width: 42ch;
    color: ${({ theme }) => theme.colors.sidebarTextMuted};
  }
`;

const NoteList = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
  margin: ${({ theme }) => theme.space(8)} 0 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: ${({ theme }) => theme.space(3)};
    align-items: flex-start;
  }

  .anticon {
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FormColumn = styled.main`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space(6)} ${({ theme }) => theme.space(5)};

  @media ${({ theme }) => theme.breakpoints.lg} {
    padding: ${({ theme }) => theme.space(8)} ${({ theme }) => theme.space(12)};
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const MobileLogo = styled.div`
  @media ${({ theme }) => theme.breakpoints.lg} {
    visibility: hidden;
  }
`;

const FormCard = styled.section`
  width: 100%;
  max-width: 560px;
  margin: auto;
  padding: ${({ theme }) => theme.space(8)} 0;

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.font.h2};
  }
`;

const Lead = styled.p`
  margin: ${({ theme }) => theme.space(2)} 0 ${({ theme }) => theme.space(6)};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
`;

const Disclaimer = styled.p`
  margin: ${({ theme }) => theme.space(5)} 0 0;
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

/** Only allow redirects back into the admin portal. */
function safeNextPath(value: string | null): string {
  return value && value.startsWith("/admin/") && !value.startsWith("//") ? value : ADMIN_HOME_PATH;
}

export function AdminLoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const { currentAdmin, sessionRestored, sessionError, signInStatus, signInError } =
    useAppSelector(selectAuth);
  const submitting = signInStatus === "loading";

  useEffect(() => {
    if (sessionRestored && currentAdmin) router.replace(nextPath);
  }, [sessionRestored, currentAdmin, nextPath, router]);

  const handleFinish = (values: SignInCredentials) => {
    dispatch(signIn({ email: values.email.trim(), password: values.password }));
  };

  return (
    <Page>
      <BrandPanel>
        <BrandLogo tone="onDark" size="lg" />
        <div>
          <h2>Administration portal</h2>
          <p>
            Manage trends, safety, contests, support and finance. Your access is set by the role
            assigned to your administrator account.
          </p>
          <NoteList>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>Sign in with the account issued to you by a Super Administrator.</span>
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>Navigation and actions are limited to your role.</span>
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>Module screens still show demo data until their APIs are connected.</span>
            </li>
          </NoteList>
        </div>
        <small>Sessions are held in secure, httpOnly cookies.</small>
      </BrandPanel>

      <FormColumn>
        <TopBar>
          <MobileLogo>
            <BrandLogo />
          </MobileLogo>
          <TopActions>
            <ThemeSwitcher />
            <Link href="/">Back to website</Link>
          </TopActions>
        </TopBar>

        <FormCard aria-labelledby="login-title">
          <h1 id="login-title">Sign in</h1>
          <Lead>Use your administrator email and password.</Lead>

          {sessionError && !signInError ? (
            <ErrorAlert
              type="warning"
              showIcon
              title={
                sessionError.code === "UNAUTHENTICATED"
                  ? "Your session has ended"
                  : "Your previous session could not be checked"
              }
              description={sessionError.message}
            />
          ) : null}

          <Form<SignInCredentials>
            layout="vertical"
            requiredMark={false}
            disabled={submitting}
            onFinish={handleFinish}
            onValuesChange={() => {
              if (signInError) dispatch(clearSignInError());
            }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Enter your email address." },
                { type: "email", message: "Enter a valid email address." },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined aria-hidden="true" />}
                autoComplete="username"
                inputMode="email"
                placeholder="name@trenderalert.com"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Enter your password." }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined aria-hidden="true" />}
                autoComplete="current-password"
              />
            </Form.Item>

            {signInError ? (
              <ErrorAlert type="error" showIcon title={signInError.message} role="alert" />
            ) : null}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              icon={<ArrowRightOutlined />}
              iconPlacement="end"
              loading={submitting}
            >
              Sign in
            </Button>
          </Form>

          <Disclaimer>
            Access is checked by the TrenderAlert backend on every request. Signing in here does not
            grant permissions the backend has not assigned to your account.
          </Disclaimer>
        </FormCard>
      </FormColumn>
    </Page>
  );
}
