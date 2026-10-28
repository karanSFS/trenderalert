"use client";

import { BgColorsOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Popover, Segmented, Tooltip } from "antd";
import styled from "styled-components";
import { selectThemePreference } from "@/features/settings/themeSelectors";
import { resetTheme, setThemeMode, setThemePreset } from "@/features/settings/themeSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { THEME_PRESETS, type ThemeMode, type ThemePresetId } from "@/styles/themes";

const Panel = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(4)};
`;

const SectionLabel = styled.div`
  margin-bottom: ${({ theme }) => theme.space(2)};
  font-size: ${({ theme }) => theme.font.sizeSm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
`;

const PresetButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(3)};
  width: 100%;
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : "transparent")};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.button};
  transition: border-color var(--ta-transition-fast);

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: ${({ theme }) => theme.font.sizeSm};
    line-height: 1.35;
  }
`;

const Swatch = styled.span<{ $colors: string[] }>`
  flex: none;
  display: inline-flex;
  overflow: hidden;
  width: 36px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $colors }) =>
    `linear-gradient(90deg, ${$colors[0]} 0 33%, ${$colors[1]} 33% 66%, ${$colors[2]} 66% 100%)`};
`;

const ResetButton = styled(Button)`
  align-self: flex-start;
  padding: 0;
`;

const TriggerButton = styled(Button)<{ $onDark: boolean }>`
  && {
    color: ${({ $onDark, theme }) => ($onDark ? "#ffffff" : theme.colors.textSecondary)};
  }
`;

interface ThemeSwitcherProps {
  /** Renders a light icon button for dark headers. */
  onDark?: boolean;
}

export function ThemeSwitcher({ onDark = false }: ThemeSwitcherProps) {
  const dispatch = useAppDispatch();
  const { preset, mode } = useAppSelector(selectThemePreference);

  const content = (
    <Panel>
      <div>
        <SectionLabel id="ta-theme-mode-label">Appearance</SectionLabel>
        <Segmented<ThemeMode>
          block
          aria-labelledby="ta-theme-mode-label"
          value={mode}
          onChange={(value) => dispatch(setThemeMode(value))}
          options={[
            { label: "Light", value: "light", icon: <SunOutlined /> },
            { label: "Dark", value: "dark", icon: <MoonOutlined /> },
          ]}
        />
      </div>
      <div>
        <SectionLabel id="ta-theme-preset-label">Color theme</SectionLabel>
        <PresetList role="radiogroup" aria-labelledby="ta-theme-preset-label">
          {Object.values(THEME_PRESETS).map((option) => {
            const colors = option.modes[mode].colors;
            return (
              <PresetButton
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === preset}
                $active={option.id === preset}
                onClick={() => dispatch(setThemePreset(option.id as ThemePresetId))}
              >
                <Swatch
                  aria-hidden="true"
                  $colors={[colors.sidebarBackground, colors.primary, colors.background]}
                />
                <span>
                  {option.name}
                  <small>{option.description}</small>
                </span>
              </PresetButton>
            );
          })}
        </PresetList>
      </div>
      <ResetButton type="link" size="small" onClick={() => dispatch(resetTheme())}>
        Reset to default
      </ResetButton>
    </Panel>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight" title="Theme">
      <Tooltip title="Theme">
        <TriggerButton
          type="text"
          aria-label="Change theme"
          icon={<BgColorsOutlined />}
          $onDark={onDark}
        />
      </Tooltip>
    </Popover>
  );
}
