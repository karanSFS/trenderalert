"use client";

// The @ant-design/icons barrel creates React context at import time, which Server Components
// cannot load. Server components import icons from this client boundary instead.
export {
  AndroidFilled,
  AppleFilled,
  ArrowRightOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  FlagOutlined,
  LockOutlined,
  NodeIndexOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  RadarChartOutlined,
  SafetyOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
