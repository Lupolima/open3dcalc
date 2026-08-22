import { lazy } from "react";

export const PieChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.PieChart })),
);
export const Pie = lazy(() =>
  import("recharts").then((m) => ({ default: m.Pie })),
);
export const Cell = lazy(() =>
  import("recharts").then((m) => ({ default: m.Cell })),
);
export const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({ default: m.ResponsiveContainer })),
);
export const Tooltip = lazy(() =>
  import("recharts").then((m) => ({ default: m.Tooltip })),
);
export const Legend = lazy(() =>
  import("recharts").then((m) => ({ default: m.Legend })),
);
export const AreaChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.AreaChart })),
);
export const Area = lazy(() =>
  import("recharts").then((m) => ({ default: m.Area })),
);
export const CartesianGrid = lazy(() =>
  import("recharts").then((m) => ({ default: m.CartesianGrid })),
);
export const XAxis = lazy(() =>
  import("recharts").then((m) => ({ default: m.XAxis })),
);
export const YAxis = lazy(() =>
  import("recharts").then((m) => ({ default: m.YAxis })),
);
export const BarChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.BarChart })),
);
export const Bar = lazy(() =>
  import("recharts").then((m) => ({ default: m.Bar })),
);
