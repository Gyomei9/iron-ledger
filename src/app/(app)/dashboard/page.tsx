"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/hooks/useStore";
import StatCard from "@/components/ui/StatCard";
import VolumeChart from "@/components/charts/VolumeChart";
import FrequencyChart from "@/components/charts/FrequencyChart";
import DatePicker from "@/components/ui/DatePicker";
import { daysAgo } from "@/lib/utils";

const RANGES = ["1W", "2W", "1M", "3M", "All"] as const;
type Range = (typeof RANGES)[number] | "custom";

const RANGE_DAYS: Record<string, number> = {
  "1W": 7, "2W": 14, "1M": 30, "3M": 90, All: 9999,
};

const RANGE_LABELS: Record<string, string> = {
  "1W": "this week", "2W": "last 2 weeks", "1M": "last 30 days",
  "3M": "last 3 months", All: "all time", custom: "custom range",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { workouts, exercises, sets, loading } = useStore();
  const [range, setRange] = useState<Range>("1M");
  const [customFrom, setCustomFrom] = useState("");
  const [showCal, setShowCal] = useState(false);

  const cutoff = range === "All" ? "" : range === "custom" ? customFrom : daysAgo(RANGE_DAYS[range] || 30);

  const myWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === user?.id && (range === "All" || w.date >= cutoff)),
    [workouts, user, range, cutoff]
  );

  const allMyWorkouts = useMemo(
    () => workouts.filter((w) => w.user_id === user?.id),
    [workouts, user]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStr = weekStart.toLocaleDateString("en-CA");

    const thisWeek = myWorkouts.filter((w) => w.date >= weekStr).length;
    let totalVol = 0;
    const uniqueExNames = new Set<string>();

    for (const w of myWorkouts) {
      const exs = exercises.filter((e) => e.workout_id === w.id);
      for (const ex of exs) {
        uniqueExNames.add(ex.exercise_name);
        const ss = sets.filter((s) => s.exercise_id === ex.id);
        for (const s of ss) {
          const weight = parseFloat(String(s.weight_kg)) || 0;
          const barbell = parseFloat(String(ex.barbell_weight)) || 0;
          const reps = parseInt(String(s.reps), 10) || 0;
          totalVol += (weight + barbell) * reps;
        }
      }
    }

    return {
      count: myWorkouts.length,
      thisWeek,
      totalVol,
      volume: (totalVol / 1000).toFixed(1) + "t",
      volumeRaw: totalVol.toLocaleString() + " kg",
      uniqueEx: uniqueExNames.size,
    };
  }, [myWorkouts, exercises, sets]);

  const filteredExercises = useMemo(
    () => exercises.filter((e) => myWorkouts.some((w) => w.id === e.workout_id)),
    [exercises, myWorkouts]
  );
  const filteredSets = useMemo(
    () => sets.filter((s) => filteredExercises.some((e) => e.id === s.exercise_id)),
    [sets, filteredExercises]
  );

  if (loading) {
    return <div className="empty-state"><div className="empty-text">Loading dashboard...</div></div>;
  }

  return (
    <div>
      {/* Range bar */}
      <div className="dash-range">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`dash-range-btn${range === r ? " active" : ""}`}
          >
            {r}
          </button>
        ))}

        <button
          onClick={() => setShowCal(!showCal)}
          className={`dash-range-cal${range === "custom" ? " active" : ""}`}
          title="Custom date range"
        >
          📅
        </button>

        <Link href="/log" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>
          + Log Workout
        </Link>
      </div>

      {/* Calendar date picker */}
      {showCal && (
        <div style={{ marginBottom: "1rem" }}>
          <DatePicker
            value={customFrom}
            placeholder="Start Date"
            autoOpen
            onChange={(dateStr) => {
              setCustomFrom(dateStr);
              setRange("custom");
              setShowCal(false);
            }}
          />
        </div>
      )}

      {/* Stat cards */}
      <div className="stats-row">
        <StatCard label="Workouts" value={stats.count} sub={RANGE_LABELS[range]} colorClass="ac" />
        <StatCard label="This Week" value={stats.thisWeek} sub="sessions" colorClass="green" />
        <StatCard label="Volume" value={stats.volume} sub={stats.volumeRaw} />
        <StatCard label="Exercises" value={stats.uniqueEx} sub="unique" />
      </div>

      {/* Volume chart */}
      <div className="card" style={{ marginBottom: "1.2rem" }}>
        <div className="card-header">
          <h3 className="card-title">Volume by Day Type</h3>
        </div>
        <div className="card-body">
          <div className="chart-wrap">
            <VolumeChart workouts={myWorkouts} exercises={filteredExercises} sets={filteredSets} />
          </div>
        </div>
      </div>

      {/* Frequency chart - uses ALL user workouts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Progress</h3>
        </div>
        <div className="card-body">
          <div className="chart-wrap">
            <FrequencyChart workouts={allMyWorkouts} />
          </div>
        </div>
      </div>
    </div>
  );
}
