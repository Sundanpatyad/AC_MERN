import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Chart, registerables } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  Search,
  Users,
  ArrowLeft,
  BookOpen,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { studyMaterialEndPoints } from "../../../services/apis";
import { fetchAllMockTests, fetchInstructorMockTest } from "../../../services/operations/mocktest";

Chart.register(...registerables);

const PAGE_SIZE = 20;

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
const CHART_COLORS = [
  "#ff4d4d",
  "#e5e5e5",
  "#a3a3a3",
  "#fb7185",
  "#737373",
  "#fafafa",
  "#ef4444",
  "#d4d4d4",
];

const PERIODS = [
  { id: "all", label: "All time", short: "All" },
  { id: "month", label: "This month", short: "Month" },
  { id: "30", label: "Last 30 days", short: "30d" },
  { id: "90", label: "Last 90 days", short: "90d" },
];

const REVENUE_FILTERS = [
  { id: "all", label: "All tests", short: "All" },
  { id: "paid", label: "With revenue", short: "Paid" },
  { id: "free", label: "Free", short: "Free" },
];

const TABS = [
  { id: "analytics", label: "Analytics" },
  { id: "tests", label: "Tests" },
];

const matchesQuery = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const normalizeName = (value) =>
  String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();

const userMatches = (user, query) => {
  if (!query) return true;
  return [
    user.firstName,
    user.lastName,
    `${user.firstName ?? ""} ${user.lastName ?? ""}`,
    user.email,
    user.mobileNumber,
  ].some((value) => matchesQuery(value, query));
};

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getRange = (period) => {
  const to = new Date();
  if (period === "all") return { from: null, to: null };
  if (period === "month") {
    return { from: new Date(to.getFullYear(), to.getMonth(), 1).toISOString(), to: to.toISOString() };
  }
  const days = period === "90" ? 90 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
};

const enrichTests = (adminTests, seriesList) => {
  const byId = new Map();
  const byName = new Map();

  seriesList.forEach((series) => {
    const price = Number(series?.price) || 0;
    const id = String(series?._id || series?.seriesId || "");
    const name = normalizeName(series?.seriesName || series?.testName);
    const meta = { price, id };
    if (id) byId.set(id, meta);
    if (name) byName.set(name, meta);
  });

  return adminTests.map((test) => {
    const match =
      byId.get(String(test.seriesId || "")) ||
      byName.get(normalizeName(test.testName));
    const price = Number(test.price) || match?.price || 0;
    const enrollments = test.enrollments ?? test.totalUsers ?? test.users?.length ?? 0;
    const paidRevenue = Number(test.paidRevenue) || 0;
    const estimatedRevenue = enrollments * price;
    const revenue = paidRevenue > 0 ? paidRevenue : estimatedRevenue;

    return {
      ...test,
      seriesId: test.seriesId || match?.id || "",
      price,
      enrollments,
      paidRevenue,
      estimatedRevenue,
      revenue,
    };
  });
};

function Bone({ className = "" }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

function AdminSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4 space-y-3">
        <div className="flex gap-2">
          <Bone className="h-7 w-20 rounded-full" />
          <Bone className="h-7 w-24 rounded-full" />
          <Bone className="h-7 w-28 rounded-full" />
          <Bone className="h-7 w-28 rounded-full hidden sm:block" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-7 w-20 rounded-full" />
          <Bone className="h-7 w-28 rounded-full" />
          <Bone className="h-7 w-16 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-2xl border border-line bg-surface p-3 sm:p-5 space-y-3">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <Bone className="h-4 w-16" />
            <Bone className="h-7 w-32 rounded-lg" />
          </div>
          <Bone className="mx-auto h-[180px] w-[180px] sm:h-[200px] sm:w-[200px] rounded-full" />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 space-y-4">
          <Bone className="h-4 w-36" />
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="space-y-1.5">
              <div className="flex justify-between">
                <Bone className="h-4 w-2/5" />
                <Bone className="h-4 w-16" />
              </div>
              <Bone className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line space-y-3">
          <Bone className="h-4 w-16" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 sm:px-5 flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <Bone className="h-4 w-3/4 max-w-sm" />
                <Bone className="h-1 w-28 rounded-full hidden md:block" />
              </div>
              <Bone className="h-4 w-12 hidden sm:block" />
              <Bone className="h-4 w-10" />
              <Bone className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminCountMock() {
  const { token } = useSelector((state) => state.auth);
  const { ADMIN_MOCK_LIST, ADMIN_MOCK_PURCHASERS } = studyMaterialEndPoints;
  const [mockTestData, setMockTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuery, setTestQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [period, setPeriod] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [tab, setTab] = useState("analytics");

  const [purchasers, setPurchasers] = useState([]);
  const [purchaserTotal, setPurchaserTotal] = useState(0);
  const [purchaserPage, setPurchaserPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);
  const debouncedUserQuery = useDebouncedValue(userQuery, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const { from, to } = getRange(period);
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;

        const [adminRes, publicSeries, instructorSeries] = await Promise.all([
          axios.get(ADMIN_MOCK_LIST, { params }),
          fetchAllMockTests(token),
          token ? fetchInstructorMockTest(token) : Promise.resolve([]),
        ]);

        if (!adminRes.data.success) {
          setError(adminRes.data.message || "Failed to load mock test data.");
          return;
        }

        const seriesList = [
          ...(Array.isArray(publicSeries) ? publicSeries : []),
          ...(Array.isArray(instructorSeries) ? instructorSeries : []),
        ];
        setMockTestData(enrichTests(adminRes.data.data ?? [], seriesList));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load admin data. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ADMIN_MOCK_LIST, period, token]);

  const analyticsTests = useMemo(() => {
    return mockTestData
      .filter((test) => {
        if (revenueFilter === "paid" && !(test.revenue > 0)) return false;
        if (revenueFilter === "free" && Number(test.price) > 0) return false;
        return true;
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [mockTestData, revenueFilter]);

  const purchaserTests = useMemo(() => {
    const q = testQuery.trim().toLowerCase();
    return mockTestData
      .filter((test) => !q || matchesQuery(test.testName, q))
      .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
  }, [mockTestData, testQuery]);

  const totals = useMemo(() => {
    const totalRevenue = analyticsTests.reduce((sum, test) => sum + (test.revenue || 0), 0);
    const totalEnrollments = analyticsTests.reduce((sum, test) => sum + (test.enrollments || 0), 0);
    return {
      totalRevenue,
      totalEnrollments,
      totalTests: analyticsTests.length,
      avgRevenue: totalEnrollments ? totalRevenue / totalEnrollments : 0,
    };
  }, [analyticsTests]);

  useEffect(() => {
    if (chartMetric === "revenue" && totals.totalRevenue === 0 && totals.totalEnrollments > 0) {
      setChartMetric("enrollments");
    }
  }, [chartMetric, totals.totalRevenue, totals.totalEnrollments]);

  const fetchPurchaserPage = useCallback(async (test, nextPage, search, append) => {
    if (!test || loadingMoreRef.current) return;
    const reqId = ++requestIdRef.current;
    loadingMoreRef.current = true;
    setUsersLoading(true);

    const applyRows = (rows, total, more) => {
      if (reqId !== requestIdRef.current) return;
      setPurchasers((prev) => (append ? [...prev, ...rows] : rows));
      setPurchaserTotal(total);
      setHasMore(more);
      setPurchaserPage(nextPage);
    };

    try {
      if (test.seriesId) {
        const response = await axios.get(`${ADMIN_MOCK_PURCHASERS}/${test.seriesId}`, {
          params: {
            page: nextPage,
            limit: PAGE_SIZE,
            search: search || undefined,
          },
        });
        const rows = response.data.data ?? [];
        const pagination = response.data.pagination ?? {};
        applyRows(
          rows,
          pagination.total ?? rows.length,
          Boolean(pagination.hasNextPage)
        );
      } else {
        const all = Array.isArray(test.users) ? test.users : [];
        const q = String(search || "").trim().toLowerCase();
        const filtered = q ? all.filter((user) => userMatches(user, q)) : all;
        const slice = filtered.slice(0, nextPage * PAGE_SIZE);
        applyRows(slice, filtered.length, slice.length < filtered.length);
      }
    } catch (err) {
      console.error("Error fetching purchasers:", err);
      const all = Array.isArray(test.users) ? test.users : [];
      const q = String(search || "").trim().toLowerCase();
      const filtered = q ? all.filter((user) => userMatches(user, q)) : all;
      const slice = filtered.slice(0, nextPage * PAGE_SIZE);
      applyRows(slice, filtered.length, slice.length < filtered.length);
    } finally {
      if (reqId === requestIdRef.current) {
        loadingMoreRef.current = false;
        setUsersLoading(false);
      }
    }
  }, [ADMIN_MOCK_PURCHASERS]);

  useEffect(() => {
    if (!selectedTest) return;
    loadingMoreRef.current = false;
    fetchPurchaserPage(selectedTest, 1, debouncedUserQuery, false);
  }, [selectedTest, debouncedUserQuery, fetchPurchaserPage]);

  useEffect(() => {
    if (!selectedTest || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchPurchaserPage(selectedTest, purchaserPage + 1, debouncedUserQuery, true);
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedTest, hasMore, purchaserPage, debouncedUserQuery, fetchPurchaserPage]);

  const openTest = (test) => {
    setSelectedTest(test);
    setUserQuery("");
    setPurchasers([]);
    setPurchaserTotal(test.enrollments || 0);
    setPurchaserPage(1);
    setHasMore(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeTest = () => {
    setSelectedTest(null);
    setUserQuery("");
    setPurchasers([]);
    setPurchaserTotal(0);
    setPurchaserPage(1);
    setHasMore(false);
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    if (nextTab !== "tests") closeTest();
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-5 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-fg">
          Admin Console
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted leading-snug">
          {tab === "analytics"
            ? "Revenue and enrollment analytics for each mock test."
            : selectedTest
              ? `Successful purchasers for ${selectedTest.testName}`
              : "Check who purchased each mock test successfully."}
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-full border border-line bg-surface p-1 w-full sm:max-w-sm">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => switchTab(item.id)}
            className={`rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === item.id ? "bg-solid text-solid-fg" : "text-muted hover:text-fg"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <AdminSkeleton />
      ) : error ? (
        <p className="text-sm text-brand">{error}</p>
      ) : tab === "analytics" ? (
        <>
          <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4 space-y-3">
            <FilterRow label="Period" value={period} onChange={setPeriod} options={PERIODS} />
            <FilterRow label="Revenue" value={revenueFilter} onChange={setRevenueFilter} options={REVENUE_FILTERS} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Revenue" value={formatINR(totals.totalRevenue)} icon={<IndianRupee className="w-4 h-4" />} />
            <StatCard label="Enrollments" value={totals.totalEnrollments.toLocaleString("en-IN")} icon={<Users className="w-4 h-4" />} />
            <StatCard label="Tests" value={totals.totalTests} icon={<BookOpen className="w-4 h-4" />} />
            <StatCard label="Avg / user" value={formatINR(totals.avgRevenue)} icon={<TrendingUp className="w-4 h-4" />} />
          </div>

          <AnalyticsPanel
            tests={analyticsTests}
            metric={chartMetric}
            onMetricChange={setChartMetric}
            totalRevenue={totals.totalRevenue}
            totalEnrollments={totals.totalEnrollments}
          />

          <TestListView
            title="Revenue by test"
            subtitle="Price, enrollments, and money made for each mock test."
            tests={analyticsTests}
            maxRevenue={Math.max(...analyticsTests.map((test) => test.revenue || 0), 1)}
          />
        </>
      ) : selectedTest ? (
        <UserListView
          test={selectedTest}
          query={userQuery}
          onQueryChange={setUserQuery}
          users={purchasers}
          total={purchaserTotal}
          loading={usersLoading}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
          onBack={closeTest}
        />
      ) : (
        <TestListView
          title="Mock tests"
          subtitle="Click a test to see who purchased it successfully. Search by test name, student, email, or mobile."
          tests={purchaserTests}
          query={testQuery}
          onQueryChange={setTestQuery}
          onSelect={openTest}
          maxRevenue={Math.max(...purchaserTests.map((test) => test.revenue || 0), 1)}
        />
      )}
    </div>
  );
}

function FilterRow({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-subtle">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`min-h-9 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
              value === option.id
                ? "bg-solid text-solid-fg border-transparent"
                : "border-line text-muted hover:text-fg"
            }`}
          >
            <span className="sm:hidden">{option.short || option.label}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5 min-w-0">
      <div className="flex items-center gap-1.5 text-muted">
        <span className="shrink-0">{icon}</span>
        <p className="text-[11px] sm:text-xs truncate">{label}</p>
      </div>
      <p className="mt-2 text-base sm:text-2xl lg:text-3xl font-semibold text-fg tabular-nums leading-tight break-words">
        {value}
      </p>
    </div>
  );
}

function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 w-full h-11 rounded-full border border-line bg-page px-3.5">
      <Search className="w-4 h-4 text-subtle shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-full bg-transparent text-sm text-fg placeholder:text-subtle outline-none border-0 p-0 shadow-none appearance-none"
      />
    </div>
  );
}

function AnalyticsPanel({ tests, metric, onMetricChange, totalRevenue, totalEnrollments }) {
  const topTests = tests
    .filter((test) => (metric === "revenue" ? test.revenue : test.enrollments) > 0)
    .slice(0, 8);

  const chartData = {
    labels: topTests.map((test) => test.testName || "Untitled"),
    datasets: [
      {
        data: topTests.map((test) => (metric === "revenue" ? test.revenue : test.enrollments)),
        backgroundColor: CHART_COLORS.slice(0, Math.max(topTests.length, 1)),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-medium text-fg">Share</h2>
          <div className="flex rounded-full border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => onMetricChange("revenue")}
              className={`min-h-9 px-3 py-2 text-xs font-medium ${
                metric === "revenue" ? "bg-solid text-solid-fg" : "text-muted hover:text-fg"
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => onMetricChange("enrollments")}
              className={`min-h-9 px-3 py-2 text-xs font-medium ${
                metric === "enrollments" ? "bg-solid text-solid-fg" : "text-muted hover:text-fg"
              }`}
            >
              Enrollments
            </button>
          </div>
        </div>
        {topTests.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No data to chart yet.</p>
        ) : (
          <div className="h-40 sm:h-[220px]">
            <Doughnut
              data={chartData}
              options={{
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const value = ctx.raw || 0;
                        return metric === "revenue"
                          ? ` ${formatINR(value)}`
                          : ` ${Number(value).toLocaleString("en-IN")} enrolled`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
        <p className="mt-3 text-center text-xs text-subtle">
          {metric === "revenue"
            ? `${formatINR(totalRevenue)} total`
            : `${totalEnrollments.toLocaleString("en-IN")} enrollments`}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-medium text-fg mb-4">
          {metric === "revenue" ? "Revenue by test" : "Enrollments by test"}
        </h2>
        {topTests.length === 0 ? (
          <p className="text-sm text-muted">No tests to rank yet.</p>
        ) : (
          <ul className="space-y-3">
            {topTests.map((test, index) => {
              const value = metric === "revenue" ? test.revenue : test.enrollments;
              const max = metric === "revenue" ? totalRevenue : totalEnrollments;
              const pct = max ? (value / max) * 100 : 0;
              return (
                <li key={test.seriesId || test.testName || index}>
                  <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                    <span className="text-fg truncate">{test.testName || "Untitled"}</span>
                    <span className="text-muted tabular-nums shrink-0">
                      {metric === "revenue" ? formatINR(value) : Number(value).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                    <div className="h-full rounded-full bg-solid" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function TestListView({
  title,
  subtitle,
  tests,
  query,
  onQueryChange,
  onSelect,
  maxRevenue,
}) {
  const clickable = typeof onSelect === "function";

  return (
    <div className="rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-line space-y-3">
        <div>
          <h2 className="text-sm font-medium text-fg">{title}</h2>
          <p className="hidden sm:block text-xs text-subtle mt-0.5">{subtitle}</p>
        </div>
        {onQueryChange && (
          <SearchField value={query} onChange={onQueryChange} placeholder="Search tests or users…" />
        )}
      </div>

      {tests.length === 0 ? (
        <p className="p-6 text-sm text-muted">No tests match that search.</p>
      ) : (
        <>
          <div className="md:hidden divide-y divide-line">
            {tests.map((test, index) => (
              <button
                key={test.seriesId || test.testName || index}
                type="button"
                onClick={() => clickable && onSelect(test)}
                className={`w-full text-left p-4 ${clickable ? "hover:bg-elevated transition-colors" : ""}`}
              >
                <p className="text-sm font-medium text-fg">{test.testName || "Untitled"}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-subtle">Price</p>
                    <p className="text-fg tabular-nums">{formatINR(test.price)}</p>
                  </div>
                  <div>
                    <p className="text-subtle">{clickable ? "Purchases" : "Enrolled"}</p>
                    <p className="text-fg tabular-nums">{Number(test.enrollments || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-subtle">Revenue</p>
                    <p className="text-fg font-medium tabular-nums">{formatINR(test.revenue)}</p>
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-solid"
                    style={{ width: `${Math.max((test.revenue / maxRevenue) * 100, test.revenue ? 4 : 0)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-subtle">
                  <th className="px-4 lg:px-5 py-3 font-medium w-12">#</th>
                  <th className="px-4 lg:px-5 py-3 font-medium">Test</th>
                  <th className="px-4 lg:px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-4 lg:px-5 py-3 font-medium text-right">
                    {clickable ? "Purchases" : "Enrollments"}
                  </th>
                  <th className="px-4 lg:px-5 py-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr
                    key={test.seriesId || test.testName || index}
                    onClick={() => clickable && onSelect(test)}
                    className={`border-b border-line last:border-0 ${
                      clickable ? "cursor-pointer hover:bg-elevated transition-colors" : ""
                    }`}
                  >
                    <td className="px-4 lg:px-5 py-3 text-subtle">{index + 1}</td>
                    <td className="px-4 lg:px-5 py-3">
                      <p className="text-fg font-medium">{test.testName || "Untitled"}</p>
                      <div className="mt-1.5 h-1 w-28 rounded-full bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full bg-solid"
                          style={{ width: `${Math.max((test.revenue / maxRevenue) * 100, test.revenue ? 4 : 0)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 lg:px-5 py-3 text-right text-muted tabular-nums">{formatINR(test.price)}</td>
                    <td className="px-4 lg:px-5 py-3 text-right text-fg tabular-nums">
                      {Number(test.enrollments || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 lg:px-5 py-3 text-right text-fg font-medium tabular-nums">
                      {formatINR(test.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function UserListView({
  test,
  query,
  onQueryChange,
  users,
  total,
  loading,
  hasMore,
  sentinelRef,
  onBack,
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 min-h-9 text-sm text-muted hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All tests
      </button>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Price" value={formatINR(test.price)} icon={<IndianRupee className="w-4 h-4" />} />
        <StatCard label="Purchases" value={Number(total || test.enrollments || 0).toLocaleString("en-IN")} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Revenue" value={formatINR(test.revenue)} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line space-y-3">
          <div>
            <h2 className="text-sm font-medium text-fg">{test.testName}</h2>
            <p className="text-xs text-subtle mt-0.5">
              {Number(total || 0).toLocaleString("en-IN")} successful purchase{total === 1 ? "" : "s"}
              {query ? " matching search" : ""}
            </p>
          </div>
          <SearchField value={query} onChange={onQueryChange} placeholder="Search by name, email, or mobile…" />
        </div>

        {users.length === 0 && !loading ? (
          <p className="p-6 text-sm text-muted">No users match that search.</p>
        ) : (
          <>
            <div className="md:hidden divide-y divide-line">
              {users.map((user, index) => (
                <div key={user.userId || user._id || `${user.email}-${index}`} className="px-4 py-3">
                  <p className="text-xs text-subtle">#{index + 1}</p>
                  <p className="text-sm font-medium text-fg mt-0.5">
                    {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"}
                  </p>
                  <p className="text-xs text-muted mt-1 break-all">{user.email || "—"}</p>
                  <p className="text-xs text-muted mt-0.5">{user.mobileNumber || "—"}</p>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-subtle">
                    <th className="px-4 lg:px-5 py-3 font-medium w-12">#</th>
                    <th className="px-4 lg:px-5 py-3 font-medium">Name</th>
                    <th className="px-4 lg:px-5 py-3 font-medium">Email</th>
                    <th className="px-4 lg:px-5 py-3 font-medium">Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.userId || user._id || `${user.email}-${index}`} className="border-b border-line last:border-0">
                      <td className="px-4 lg:px-5 py-3 text-subtle">{index + 1}</td>
                      <td className="px-4 lg:px-5 py-3 text-fg font-medium">
                        {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"}
                      </td>
                      <td className="px-4 lg:px-5 py-3 text-muted break-all">{user.email || "—"}</td>
                      <td className="px-4 lg:px-5 py-3 text-muted">{user.mobileNumber || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div ref={sentinelRef} className="px-4 sm:px-5 py-3 border-t border-line text-center">
              {loading ? (
                <p className="text-[11px] sm:text-xs text-subtle">Loading purchasers…</p>
              ) : hasMore ? (
                <p className="text-[11px] sm:text-xs text-subtle">
                  Showing {users.length} of {Number(total).toLocaleString("en-IN")} — scroll for more
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs text-subtle">
                  {users.length} of {Number(total).toLocaleString("en-IN")} purchasers
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
