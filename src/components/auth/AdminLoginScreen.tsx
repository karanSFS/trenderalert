"use client";

import { ArrowRightOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Alert, Button, Skeleton } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ErrorState } from "@/components/ui/ErrorState";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { clearSignInError, fetchDemoAccounts, signInDemo } from "@/features/auth/authSlice";
import { selectAuth } from "@/features/auth/authSelectors";
import { ADMIN_HOME_PATH } from "@/lib/constants/app";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { getInitials } from "@/lib/formatters/text";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

const AccountList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(6)};
`;

const AccountOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(4)};
  width: 100%;
  padding: ${({ theme }) => theme.space(4)};
  text-align: left;
  font: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  background: ${({ $selected, theme }) => ($selected ? theme.colors.primarySoft : theme.colors.surface)};
  border: 1px solid
    ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ $selected, theme }) => ($selected ? `inset 0 0 0 1px ${theme.colors.primary}` : "none")};
  transition:
    border-color var(--ta-transition-fast),
    background-color var(--ta-transition-fast);

  &:hover {
    border-color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.borderStrong)};
  }
`;

const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onPrimary};
  background: ${({ theme }) => theme.colors.primary};
`;

const AccountText = styled.span`
  flex: 1;
  min-width: 0;
  line-height: 1.4;

  strong {
    display: block;
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Check = styled(CheckCircleFilled)<{ $visible: boolean }>`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textPrimary};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
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
  const {
    currentAdmin,
    sessionRestored,
    demoAccounts,
    demoAccountsStatus,
    demoAccountsError,
    signInStatus,
    signInError,
  } = useAppSelector(selectAuth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveSelectedId = selectedId ?? demoAccounts[0]?.id ?? null;

  useEffect(() => {
    if (demoAccountsStatus === "idle") dispatch(fetchDemoAccounts());
  }, [demoAccountsStatus, dispatch]);

  useEffect(() => {
    if (sessionRestored && currentAdmin) router.replace(nextPath);
  }, [sessionRestored, currentAdmin, nextPath, router]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!effectiveSelectedId) return;
    dispatch(signInDemo(effectiveSelectedId));
  };

  return (
    <Page>
      <BrandPanel>
        <BrandLogo tone="onDark" size="lg" />
        <div>
          <h2>Administration portal demo</h2>
          <p>
            Explore how TrenderAlert staff will manage trends, safety, contests, support and
            finance. Choose a role to see exactly what that role can access.
          </p>
          <NoteList>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>Every record is fictional sample data.</span>
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>Actions update the demo only. Nothing reaches a real account or payment.</span>
            </li>
            <li>
              <CheckCircleFilled aria-hidden="true" />
              <span>You can switch roles at any time from the profile menu.</span>
            </li>
          </NoteList>
        </div>
        <small>Demo environment. Not production authentication.</small>
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
          <h1 id="login-title">Sign in to the demo</h1>
          <Lead>Select a demo administrator. No password is needed in demo mode.</Lead>

          {demoAccountsStatus === "failed" ? (
            <ErrorState
              compact
              title="Demo accounts could not be loaded"
              message={demoAccountsError?.message}
              onRetry={() => dispatch(fetchDemoAccounts())}
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <AccountList
                role="radiogroup"
                aria-label="Demo accounts"
                aria-busy={demoAccountsStatus !== "succeeded"}
              >
                {demoAccountsStatus !== "succeeded"
                  ? Array.from({ length: 5 }, (_, index) => (
                      <Skeleton
                        key={index}
                        active
                        avatar
                        paragraph={{ rows: 1 }}
                        title={{ width: "40%" }}
                      />
                    ))
                  : demoAccounts.map((account) => {
                      const selected = account.id === effectiveSelectedId;
                      return (
                        <AccountOption
                          key={account.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          $selected={selected}
                          onClick={() => {
                            setSelectedId(account.id);
                            dispatch(clearSignInError());
                          }}
                        >
                          <Avatar aria-hidden="true">{getInitials(account.displayName)}</Avatar>
                          <AccountText>
                            <strong>
                              {ROLE_LABELS[account.role]} · {account.displayName}
                            </strong>
                            <small>{ROLE_DESCRIPTIONS[account.role]}</small>
                          </AccountText>
                          <Check aria-hidden="true" $visible={selected} />
                        </AccountOption>
                      );
                    })}
              </AccountList>

              {signInError ? (
                <ErrorAlert type="error" showIcon title={signInError.message} />
              ) : null}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                loading={signInStatus === "loading"}
                disabled={!effectiveSelectedId || demoAccountsStatus !== "succeeded"}
              >
                Enter demo portal
              </Button>
            </form>
          )}

          <Disclaimer>
            Demo sign-in only. Production access will require backend authentication with strong
            credentials and server-side authorization for every action.
          </Disclaimer>
        </FormCard>
      </FormColumn>
    </Page>
  );
}
