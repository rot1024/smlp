import { useState, useEffect } from "react";
import { InputForm } from "./components/InputForm";
import { PageList } from "./components/PageList";
import { WeeklySummary } from "./components/WeeklySummary";
import { DailySchedule } from "./components/DailySchedule";
import { GanttChart } from "./components/GanttChart";
import { ExportButtons } from "./components/ExportButtons";
import { parseSMLPString } from "./lib/parser";
import { createPagesFromSMLP, calculatePanelMinutes } from "./lib/autoAssign";
import { schedulePages, generateWeekSummaries } from "./lib/scheduler";
import { loadFromLocalStorage } from "./lib/export";
import type { Project, ProjectSettings, Page, DaySchedule, WeekSummary } from "./types";

function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [weekSummaries, setWeekSummaries] = useState<WeekSummary[]>([]);
  const [activeTab, setActiveTab] = useState<"pages" | "summary" | "daily" | "gantt">("pages");

  useEffect(() => {
    // Try to load saved project on mount
    const saved = loadFromLocalStorage("smlp-project") as Project | null;
    if (saved) {
      setProject(saved);
      if (saved.pages) setPages(saved.pages);
      if (saved.schedule) setSchedule(saved.schedule);
      if (saved.weekSummaries) setWeekSummaries(saved.weekSummaries);
    }
  }, []);

  const handleSubmit = (settings: ProjectSettings) => {
    // Parse SMLP string
    const smlpPages = parseSMLPString(settings.smlpString);

    // Create pages with auto-assigned panel sizes
    const newPages = createPagesFromSMLP(smlpPages, settings.timeSettings);

    // Generate schedule
    const newSchedule = schedulePages(newPages, settings);

    // Generate week summaries
    const newWeekSummaries = generateWeekSummaries(newSchedule);

    // Create project
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: "漫画工程表",
      settings,
      pages: newPages,
      schedule: newSchedule,
      weekSummaries: newWeekSummaries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProject(newProject);
    setPages(newPages);
    setSchedule(newSchedule);
    setWeekSummaries(newWeekSummaries);
  };

  const handlePageUpdate = (updatedPage: Page) => {
    if (!project) return;

    // Update pages
    const updatedPages = pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));

    // Recalculate panel minutes based on new sizes
    const recalculatedPages = updatedPages.map((page) => ({
      ...page,
      panels: page.panels.map((panel) => ({
        ...panel,
        estimatedMinutes: calculatePanelMinutes(panel.size, project.settings.timeSettings),
      })),
    }));

    // Regenerate schedule
    const newSchedule = schedulePages(recalculatedPages, project.settings);
    const newWeekSummaries = generateWeekSummaries(newSchedule);

    // Update state
    setPages(recalculatedPages);
    setSchedule(newSchedule);
    setWeekSummaries(newWeekSummaries);

    // Update project
    const updatedProject = {
      ...project,
      pages: recalculatedPages,
      schedule: newSchedule,
      weekSummaries: newWeekSummaries,
      updatedAt: new Date().toISOString(),
    };
    setProject(updatedProject);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8">
                <path
                  d="M 50 5 
                         L 30 45
                         Q 30 48 32 50
                         L 40 85
                         Q 50 95 50 95
                         Q 50 95 60 85
                         L 68 50
                         Q 70 48 70 45
                         L 50 5 Z"
                  fill="#000"
                />
                <path
                  d="M 50 15
                         L 47 75
                         Q 50 85 50 85
                         Q 50 85 53 75
                         L 50 15 Z"
                  fill="#000"
                  opacity="0.7"
                />
                <circle cx="50" cy="92" r="3" fill="#000" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">漫画工程表ジェネレータ</h1>
            </div>
            <ExportButtons project={project} schedule={schedule} weekSummaries={weekSummaries} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <InputForm onSubmit={handleSubmit} />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-8">
            {pages.length > 0 && (
              <>
                {/* Output Tabs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab("pages")}
                        className={`py-2 px-6 border-b-2 font-medium text-sm ${
                          activeTab === "pages"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        ページ一覧
                      </button>
                      <button
                        onClick={() => setActiveTab("summary")}
                        className={`py-2 px-6 border-b-2 font-medium text-sm ${
                          activeTab === "summary"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        週次サマリ
                      </button>
                      <button
                        onClick={() => setActiveTab("daily")}
                        className={`py-2 px-6 border-b-2 font-medium text-sm ${
                          activeTab === "daily"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        日別スケジュール
                      </button>
                      <button
                        onClick={() => setActiveTab("gantt")}
                        className={`py-2 px-6 border-b-2 font-medium text-sm ${
                          activeTab === "gantt"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        ガントチャート
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === "pages" && (
                      <PageList pages={pages} onPageUpdate={handlePageUpdate} />
                    )}
                    {activeTab === "summary" && <WeeklySummary summaries={weekSummaries} />}
                    {activeTab === "daily" && <DailySchedule schedule={schedule} />}
                    {activeTab === "gantt" && <GanttChart schedule={schedule} />}
                  </div>
                </div>
              </>
            )}

            {pages.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">
                  左のフォームにSMLP文字列と設定を入力して、「プラン生成」をクリックしてください。
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
