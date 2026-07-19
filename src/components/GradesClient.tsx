"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ParsedRow = {
  term: string;
  code: string;
  name: string;
  credits: number;
  score: number | null;
  confidence: string;
  requiredType?: string | null;
  programCode?: string;
  categoryCode?: string;
};

export function GradesClient({
  overallAvg,
  overallGpa4,
  overallGpa43,
  categoryStats,
  programStats,
  enrollments,
}: {
  overallAvg: number | null;
  overallGpa4: number | null;
  overallGpa43: number | null;
  categoryStats: { code: string; name: string; average: number | null; credits: number }[];
  programStats: { code: string; name: string; average: number | null; credits: number }[];
  enrollments: {
    id: string;
    term: string;
    name: string;
    credits: number;
    score: number | null;
    status: string;
  }[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    term: "",
    name: "",
    credits: "",
    score: "",
    status: "taken",
  });

  function startEdit(e: {
    id: string;
    term: string;
    name: string;
    credits: number;
    score: number | null;
    status: string;
  }) {
    setEditId(e.id);
    setEditForm({
      term: e.term,
      name: e.name,
      credits: String(e.credits),
      score: e.score == null ? "" : String(e.score),
      status: e.status,
    });
  }

  async function saveEdit(id: string) {
    setLoading(true);
    const scoreVal = editForm.score === "" ? null : Number(editForm.score);
    const res = await fetch("/api/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        term: editForm.term,
        customName: editForm.name,
        credits: Number(editForm.credits),
        score: scoreVal,
        status: editForm.status,
        countInAvg: scoreVal != null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMessage("更正失敗");
      return;
    }
    setEditId(null);
    setMessage("已更正成績紀錄");
    router.refresh();
  }

  async function parseFile(file?: File | null, demo = false) {
    setLoading(true);
    setMessage("");
    const form = new FormData();
    if (demo) form.set("demo", "1");
    if (file) form.set("file", file);
    const res = await fetch("/api/transcript", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "解析失敗");
      return;
    }
    setRows(data.rows || []);
    setPreview(data.textPreview || "");
    const extra = data.truncated ? `（已達上限 ${data.maxRows || 300} 筆）` : "";
    const src =
      data.source === "image" ? "圖片辨識" : data.source === "pdf" ? "PDF 解析" : "解析";
    setMessage(
      data.count
        ? `${src}到 ${data.count} 筆${extra}，請確認後匯入`
        : "未辨識到科目，請改傳較清晰的 PDF／截圖，或使用示範資料"
    );
  }

  async function importRows() {
    setLoading(true);
    const res = await fetch("/api/transcript", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "匯入失敗");
      return;
    }
    setMessage(`已匯入 ${data.imported} 筆`);
    setRows([]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-[var(--ink-muted)]">總加權平均</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
            {overallAvg ?? "—"}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-[var(--ink-muted)]">GPA（4.0）</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
            {overallGpa4 ?? "—"}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-[var(--ink-muted)]">GPA（4.3）</div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
            {overallGpa43 ?? "—"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--brand-deep)]">依學制平均</h2>
          <ul className="mt-3 space-y-2">
            {programStats.map((p) => (
              <li key={p.code} className="flex justify-between rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm">
                <span>{p.name}</span>
                <span>
                  {p.average ?? "—"}（{p.credits} 學分）
                </span>
              </li>
            ))}
            {programStats.length === 0 ? (
              <li className="text-sm text-[var(--ink-muted)]">尚無成績資料</li>
            ) : null}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--brand-deep)]">依類科平均</h2>
          <ul className="mt-3 space-y-2">
            {categoryStats.map((c) => (
              <li key={c.code} className="flex justify-between rounded-xl bg-[var(--bg-accent)] px-3 py-2 text-sm">
                <span>{c.name}</span>
                <span>
                  {c.average ?? "—"}（{c.credits} 學分）
                </span>
              </li>
            ))}
            {categoryStats.length === 0 ? (
              <li className="text-sm text-[var(--ink-muted)]">尚無成績資料</li>
            ) : null}
          </ul>
        </div>
      </div>

      {enrollments.length > 0 ? (
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--brand-deep)]">已匯入成績明細（{enrollments.length}）</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            未達 60 分以紅色標示；點右側鉛筆可手動更正
          </p>
          <div className="mt-3 max-h-96 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--bg-accent)]">
                <tr className="text-[var(--ink-muted)]">
                  <th className="px-2 py-2">學期</th>
                  <th className="px-2 py-2">科目</th>
                  <th className="px-2 py-2">學分</th>
                  <th className="px-2 py-2">成績</th>
                  <th className="px-2 py-2">狀態</th>
                  <th className="px-2 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const failed = e.score != null && e.score < 60;
                  const editing = editId === e.id;
                  return (
                    <tr key={e.id} className={`border-t border-[var(--line)] ${failed && !editing ? "bg-[#fef2f2]" : ""}`}>
                      {editing ? (
                        <>
                          <td className="px-2 py-2">
                            <input
                              className="input !rounded-lg !px-2 !py-1"
                              value={editForm.term}
                              onChange={(ev) => setEditForm({ ...editForm, term: ev.target.value })}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              className="input !rounded-lg !px-2 !py-1"
                              value={editForm.name}
                              onChange={(ev) => setEditForm({ ...editForm, name: ev.target.value })}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              className="input !rounded-lg !px-2 !py-1 !w-20"
                              type="number"
                              step="0.5"
                              value={editForm.credits}
                              onChange={(ev) => setEditForm({ ...editForm, credits: ev.target.value })}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              className="input !rounded-lg !px-2 !py-1 !w-20"
                              value={editForm.score}
                              onChange={(ev) => setEditForm({ ...editForm, score: ev.target.value })}
                              placeholder="—"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              className="input !rounded-lg !px-2 !py-1"
                              value={editForm.status}
                              onChange={(ev) => setEditForm({ ...editForm, status: ev.target.value })}
                            >
                              <option value="taken">已修</option>
                              <option value="in_progress">修習中</option>
                              <option value="planned">計畫</option>
                              <option value="failed">不及格</option>
                              <option value="transferred">抵免</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                className="btn btn-primary !px-2 !py-1 text-xs"
                                onClick={() => saveEdit(e.id)}
                                disabled={loading}
                              >
                                存
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost !px-2 !py-1 text-xs"
                                onClick={() => setEditId(null)}
                              >
                                取消
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-2">{e.term}</td>
                          <td className={`px-2 py-2 ${failed ? "font-semibold text-[var(--danger)]" : ""}`}>
                            {e.name}
                          </td>
                          <td className="px-2 py-2">{e.credits}</td>
                          <td className={`px-2 py-2 font-semibold ${failed ? "text-[var(--danger)]" : ""}`}>
                            {e.score ?? "—"}
                            {failed ? "（不及格）" : ""}
                          </td>
                          <td className="px-2 py-2 text-[var(--ink-muted)]">{e.status}</td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              title="手動更正"
                              aria-label="手動更正"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--brand-deep)] hover:bg-[var(--brand-soft)]"
                              onClick={() => startEdit(e)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinejoin="round"
                                />
                                <path d="M12.5 7l4.5 4.5" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold text-[var(--brand-deep)]">上傳成績單（PDF／圖片）</h2>
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-accent)] px-4 py-3 text-sm leading-relaxed text-[var(--ink-muted)]">
          <div className="font-medium text-[var(--brand-deep)]">資料來源建議</div>
          <p className="mt-1">
            請從<strong className="text-[var(--ink)]">北市大校務系統</strong>匯出或截圖：
            <br />
            「修課歷程記錄／成績紀錄」後上傳。支援 PDF 與圖片（PNG、JPG、WEBP）。
          </p>
          <p className="mt-1">座標式雙欄解析最多可收 <strong className="text-[var(--ink)]">300 筆</strong>；圖片會以 OCR 辨識，清晰截圖效果較佳。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="btn btn-primary cursor-pointer">
            {loading ? "解析中…" : "選擇 PDF／圖片"}
            <input
              type="file"
              accept="application/pdf,.pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp"
              className="hidden"
              disabled={loading}
              onChange={(e) => parseFile(e.target.files?.[0])}
            />
          </label>
          <button type="button" className="btn btn-ghost" onClick={() => parseFile(null, true)} disabled={loading}>
            使用示範成績單
          </button>
        </div>
        {message ? <p className="text-sm text-[var(--brand)]">{message}</p> : null}
        {preview ? (
          <details className="rounded-xl bg-[#0f1f1a] p-3">
            <summary className="cursor-pointer text-xs text-[#d7ece3]">原始文字預覽（除錯用）</summary>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-[#d7ece3]">{preview}</pre>
          </details>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-[var(--brand-deep)]">
              共 {rows.length} 筆（不及格以紅色標示；上限 300 筆）
            </div>
            <div className="max-h-[32rem] overflow-auto rounded-xl border border-[var(--line)]">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-[var(--bg-accent)]">
                  <tr className="text-[var(--ink-muted)]">
                    <th className="px-3 py-2">學期</th>
                    <th className="px-3 py-2">科目</th>
                    <th className="px-3 py-2">必／選</th>
                    <th className="px-3 py-2">學分</th>
                    <th className="px-3 py-2">成績</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const failed = r.score != null && r.score < 60;
                    return (
                      <tr
                        key={`${r.name}-${r.term}-${i}`}
                        className={`border-t border-[var(--line)] ${failed ? "bg-[#fef2f2]" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            className="input !rounded-lg !px-2 !py-1"
                            value={r.term}
                            onChange={(e) => {
                              const next = [...rows];
                              next[i] = { ...r, term: e.target.value };
                              setRows(next);
                            }}
                          />
                        </td>
                        <td className={`px-3 py-2 ${failed ? "font-semibold text-[var(--danger)]" : ""}`}>
                          {r.name}
                        </td>
                        <td className="px-3 py-2">{r.requiredType || "—"}</td>
                        <td className="px-3 py-2">{r.credits}</td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            failed ? "text-[var(--danger)]" : ""
                          }`}
                        >
                          {r.score ?? "抵免／無分數"}
                          {failed ? "（不及格）" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn btn-primary" onClick={importRows} disabled={loading}>
              確認匯入全部 {rows.length} 筆
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
