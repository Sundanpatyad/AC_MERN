import { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../services/apiConnector";
import { BASE_URL, pdfEndpoints } from "../../../services/apis";
import { toast } from "@/utils/toast";
import CustomSelect from "../../common/CustomSelect";
import ConfirmationModal from "../../common/ConfirmationModal";

const emptyForm = {
  title: "",
  description: "",
  exam: "",
  access: "free",
  price: "",
  mockTests: [],
  status: "draft",
  file: null,
};

const emptyExam = {
  name: "",
  category: "",
  description: "",
  access: "free",
  price: "",
  status: "draft",
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg outline-none focus:ring-2 focus:ring-blue-500";

const StudyPdfAdmin = () => {
  const [form, setForm] = useState(emptyForm);
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mocks, setMocks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [examOpen, setExamOpen] = useState(false);
  const [examForm, setExamForm] = useState(emptyExam);
  const [editingExamId, setEditingExamId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [fileLabel, setFileLabel] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    try {
      const [pdfResponse, examResponse, categoryResponse, mockResponse] = await Promise.all([
        apiConnector("GET", `${pdfEndpoints.LIST}?manage=1`),
        apiConnector("GET", `${pdfEndpoints.EXAMS}?manage=1`),
        apiConnector("GET", pdfEndpoints.CATEGORIES),
        apiConnector("GET", `${BASE_URL}/api/v1/mock/getMockTests`),
      ]);
      setMaterials(pdfResponse.data?.data || []);
      setExams(examResponse.data?.data || []);
      setCategories(categoryResponse.data?.data || []);
      setMocks(mockResponse.data?.data || []);
    } catch {
      toast.error("Couldn't load study PDFs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleMaterials = useMemo(() => {
    if (selectedCategory === "all") return materials;
    return materials.filter((item) => item.category === selectedCategory);
  }, [materials, selectedCategory]);

  const visibleExams = useMemo(() => {
    if (selectedCategory === "all") return exams;
    return exams.filter((item) => item.category === selectedCategory);
  }, [exams, selectedCategory]);

  const examOptions = useMemo(
    () =>
      exams.map((item) => ({
        value: item._id,
        label: `${item.name} · ${item.category}`,
      })),
    [exams]
  );

  const selectedExam = exams.find((item) => item._id === form.exam);
  const examIsPaid = selectedExam?.access === "paid";

  const closeMaterial = () => {
    setMaterialOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFileLabel("");
  };

  const toggleMock = (id) => {
    setForm((current) => ({
      ...current,
      mockTests: current.mockTests.includes(id)
        ? current.mockTests.filter((item) => item !== id)
        : [...current.mockTests, id],
    }));
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description || "",
      exam: item.exam?._id || "",
      access: item.access,
      price: item.price ? String(item.price) : "",
      mockTests: (item.mockTests || []).map((mock) => mock._id || mock),
      status: item.status === "draft" ? "draft" : "published",
      file: null,
    });
    setFileLabel("");
    setMaterialOpen(true);
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await apiConnector("POST", pdfEndpoints.CATEGORIES, { name: categoryName });
      toast.success("Category created");
      setCategoryName("");
      setCategoryOpen(false);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not create category");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category) => {
    try {
      await apiConnector("DELETE", pdfEndpoints.DELETE_CATEGORY(category._id));
      toast.success("Category deleted");
      if (selectedCategory === category.name) setSelectedCategory("all");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete category");
    } finally {
      setConfirm(null);
    }
  };

  const closeExam = () => {
    setExamOpen(false);
    setEditingExamId(null);
    setExamForm(emptyExam);
  };

  const submitExam = async (event) => {
    event.preventDefault();
    if (!examForm.category) {
      toast.error("Choose a category");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: examForm.name,
        category: examForm.category,
        description: examForm.description,
        access: examForm.access,
        price: examForm.access === "paid" ? examForm.price : 0,
        status: examForm.status,
      };
      if (editingExamId) {
        await apiConnector("PUT", pdfEndpoints.UPDATE_EXAM(editingExamId), payload);
        toast.success("Exam updated");
      } else {
        await apiConnector("POST", pdfEndpoints.EXAMS, payload);
        toast.success("Exam created");
      }
      closeExam();
      setSelectedCategory(examForm.category);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save exam");
    } finally {
      setSaving(false);
    }
  };

  const removeExam = async (exam) => {
    try {
      await apiConnector("DELETE", pdfEndpoints.DELETE_EXAM(exam._id));
      toast.success("Exam deleted");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete exam");
    } finally {
      setConfirm(null);
    }
  };

  const askDeleteExam = (exam) => {
    if (exam.pdfCount > 0) {
      setConfirm({
        text1: "This exam still has PDFs",
        text2: "Delete those PDFs before deleting the exam.",
        btn1Text: "OK",
        btn2Text: "Close",
        btn1Handler: () => setConfirm(null),
        btn2Handler: () => setConfirm(null),
      });
      return;
    }
    setConfirm({
      text1: "Delete this exam?",
      text2: `"${exam.name}" will be removed.`,
      btn1Text: "Delete",
      btn2Text: "Cancel",
      btn1Handler: () => removeExam(exam),
      btn2Handler: () => setConfirm(null),
    });
  };

  const askDeleteCategory = (category) => {
    if (category.count > 0) {
      setConfirm({
        text1: "This category still has exams",
        text2: "Delete the exams in this category first.",
        btn1Text: "OK",
        btn2Text: "Close",
        btn1Handler: () => setConfirm(null),
        btn2Handler: () => setConfirm(null),
      });
      return;
    }
    setConfirm({
      text1: "Delete this category?",
      text2: `"${category.name}" will be removed.`,
      btn1Text: "Delete",
      btn2Text: "Cancel",
      btn1Handler: () => removeCategory(category),
      btn2Handler: () => setConfirm(null),
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.exam) {
      toast.error("Choose an exam");
      return;
    }
    if (!editingId && !form.file) {
      toast.error("Choose a PDF");
      return;
    }
    const soldAsSet = exams.find((item) => item._id === form.exam)?.access === "paid";
    const body = new FormData();
    body.append("title", form.title);
    body.append("description", form.description);
    body.append("exam", form.exam);
    body.append("access", soldAsSet ? "free" : form.access);
    body.append("price", !soldAsSet && form.access === "paid" ? form.price : "0");
    body.append("mockTests", form.mockTests.join(","));
    body.append("status", form.status);
    if (form.file) body.append("pdf", form.file);

    try {
      setSaving(true);
      if (editingId) {
        await apiConnector("PUT", pdfEndpoints.UPDATE(editingId), body);
        toast.success("Study material updated");
      } else {
        await apiConnector("POST", pdfEndpoints.CREATE, body);
        toast.success("Study material added");
      }
      closeMaterial();
      const savedExam = exams.find((item) => item._id === form.exam);
      if (savedExam?.category) setSelectedCategory(savedExam.category);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    try {
      await apiConnector("DELETE", pdfEndpoints.DELETE(item._id));
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Could not delete");
    } finally {
      setConfirm(null);
    }
  };

  const askDeleteMaterial = (item) => {
    setConfirm({
      text1: "Delete this material?",
      text2: `"${item.title}" will be removed. Students will no longer be able to open it.`,
      btn1Text: "Delete",
      btn2Text: "Cancel",
      btn1Handler: () => remove(item),
      btn2Handler: () => setConfirm(null),
    });
  };

  const linkedName = (id) => mocks.find((mock) => mock._id === id)?.seriesName || "Mock test";

  return (
    <div className="text-fg">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Study PDFs</h1>
          <p className="text-muted mt-1 text-sm max-w-xl">
            Category, then an exam folder, then the PDFs. Draft exams and PDFs stay hidden on the website and app until you publish them. A paid exam unlocks every PDF inside it with one purchase.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCategoryOpen(true)}
            className="px-4 py-2.5 rounded-lg border border-line bg-surface text-sm font-medium hover:bg-elevated"
          >
            Create category
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingExamId(null);
              setExamForm({
                ...emptyExam,
                category: selectedCategory === "all" ? "" : selectedCategory,
              });
              setExamOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg border border-line bg-surface text-sm font-medium hover:bg-elevated"
          >
            Create exam
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setFileLabel("");
              setMaterialOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-solid text-solid-fg text-sm font-medium hover:bg-solid-hover"
          >
            Add material
          </button>
        </div>
      </div>

      <section className="mb-8 min-w-0">
        {categories.length === 0 ? (
          <button
            type="button"
            onClick={() => setCategoryOpen(true)}
            className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted hover:text-fg"
          >
            Create the first category
          </button>
        ) : (
          <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-fg text-page"
                  : "bg-elevated text-fg hover:bg-surface"
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const active = selectedCategory === category.name;
              return (
                <div key={category._id} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`rounded-lg py-2 pl-4 pr-7 text-sm font-medium whitespace-nowrap ${
                      active ? "bg-fg text-page" : "bg-elevated text-fg hover:bg-surface"
                    }`}
                  >
                    {category.name}
                    <span className={`ml-2 text-xs ${active ? "text-page/70" : "text-muted"}`}>
                      {category.count}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => askDeleteCategory(category)}
                    className={`absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-md text-sm leading-none ${
                      active ? "text-page/80 hover:text-page" : "text-muted hover:text-fg"
                    }`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-8 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted">Exams</h2>
          <span className="text-xs text-muted">{visibleExams.length}</span>
        </div>
        {visibleExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center">
            <p className="text-sm text-muted">No exam in this category yet.</p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {visibleExams.map((exam) => (
              <article key={exam._id} className="w-72 shrink-0 rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium truncate">{exam.name}</p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${exam.status === "draft" ? "border-amber-500/40 text-amber-300" : "border-line text-muted"}`}>
                    {exam.status === "draft" ? "Draft" : "Published"}
                  </span>
                </div>
                <p className="text-sm text-muted mt-2 truncate">
                  {exam.category}
                  {" · "}
                  {exam.pdfCount} PDF{exam.pdfCount === 1 ? "" : "s"}
                  {" · "}
                  {exam.access === "paid" ? `₹${exam.price}` : "Per PDF"}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExamId(exam._id);
                      setExamForm({
                        name: exam.name,
                        category: exam.category,
                        description: exam.description || "",
                        access: exam.access,
                        price: exam.price ? String(exam.price) : "",
                        status: exam.status === "draft" ? "draft" : "published",
                      });
                      setExamOpen(true);
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-line hover:bg-elevated"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => askDeleteExam(exam)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-line text-muted hover:text-fg hover:bg-elevated"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted">
            {selectedCategory === "all" ? "All materials" : selectedCategory}
          </h2>
          <span className="text-xs text-muted">{visibleMaterials.length}</span>
        </div>
        {visibleMaterials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-sm text-muted">No material in this view.</p>
            <button
              type="button"
              onClick={() => {
                setForm({
                  ...emptyForm,
                  exam: visibleExams.length === 1 ? visibleExams[0]._id : "",
                });
                setMaterialOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-solid text-solid-fg text-sm font-medium"
            >
              Add material
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {visibleMaterials.map((item) => (
              <li key={item._id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${item.status === "draft" ? "border-amber-500/40 text-amber-300" : "border-line text-muted"}`}>
                      {item.status === "draft" ? "Draft" : "Published"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {item.exam?.name || "No exam"}
                    {" · "}
                    {item.exam?.access === "paid"
                      ? `Included · ₹${item.exam.price}`
                      : item.access === "paid"
                        ? `₹${item.price}`
                        : "Free"}
                    {(item.mockTests || []).length > 0
                      ? ` · ${(item.mockTests || []).map((mock) => mock.seriesName || "Mock test").join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-line hover:bg-elevated"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => askDeleteMaterial(item)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-line text-muted hover:text-fg hover:bg-elevated"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {examOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={submitExam}
            className="w-full max-w-md max-h-[90vh] overflow-auto rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-semibold">{editingExamId ? "Edit exam" : "Create exam"}</h2>
            <p className="text-sm text-muted mt-1">Students open this folder to see the PDFs inside it.</p>
            <div className="grid gap-4 mt-5">
              <label className="block text-sm">
                Name
                <input
                  autoFocus
                  required
                  value={examForm.name}
                  onChange={(event) => setExamForm({ ...examForm, name: event.target.value })}
                  className={fieldClass}
                  placeholder="JKSSB 2024"
                />
              </label>
              <label className="block text-sm">
                Category
                <div className="mt-1.5">
                  <CustomSelect
                    value={examForm.category}
                    onChange={(category) => setExamForm({ ...examForm, category })}
                    placeholder="Select category"
                    options={categories.map((category) => ({
                      value: category.name,
                      label: category.name,
                    }))}
                  />
                </div>
              </label>
              <label className="block text-sm">
                Status
                <div className="mt-1.5">
                  <CustomSelect
                    value={examForm.status}
                    onChange={(status) => setExamForm({ ...examForm, status })}
                    options={[
                      { value: "draft", label: "Draft — hidden from students" },
                      { value: "published", label: "Published — visible on website and app" },
                    ]}
                  />
                </div>
              </label>
              <label className="block text-sm">
                Sell the whole exam
                <div className="mt-1.5">
                  <CustomSelect
                    value={examForm.access}
                    onChange={(access) => setExamForm({ ...examForm, access })}
                    options={[
                      { value: "free", label: "No — price each PDF" },
                      { value: "paid", label: "Yes — one price unlocks all PDFs" },
                    ]}
                  />
                </div>
              </label>
              {examForm.access === "paid" && (
                <label className="block text-sm">
                  Exam price (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    value={examForm.price}
                    onChange={(event) => setExamForm({ ...examForm, price: event.target.value })}
                    className={fieldClass}
                  />
                </label>
              )}
              <label className="block text-sm">
                Description
                <textarea
                  value={examForm.description}
                  onChange={(event) => setExamForm({ ...examForm, description: event.target.value })}
                  className={fieldClass}
                  rows={3}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={closeExam} className="px-4 py-2 rounded-lg border border-line text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-solid text-solid-fg text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : editingExamId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {categoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={submitCategory}
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-semibold">Create category</h2>
            <p className="text-sm text-muted mt-1">Physics, Chemistry, Finance — one subject per category.</p>
            <label className="block text-sm mt-5">
              Name
              <input
                autoFocus
                required
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className={fieldClass}
                placeholder="JKSSB"
              />
            </label>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCategoryOpen(false);
                  setCategoryName("");
                }}
                className="px-4 py-2 rounded-lg border border-line text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-solid text-solid-fg text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {materialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-semibold">{editingId ? "Edit material" : "Add material"}</h2>
            <div className="grid gap-4 sm:grid-cols-2 mt-5">
              <label className="block text-sm sm:col-span-2">
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                Status
                <div className="mt-1.5">
                  <CustomSelect
                    value={form.status}
                    onChange={(status) => setForm({ ...form, status })}
                    options={[
                      { value: "draft", label: "Draft — hidden from students" },
                      { value: "published", label: "Published — visible on website and app" },
                    ]}
                  />
                </div>
              </label>
              <label className="block text-sm sm:col-span-2">
                Exam
                <div className="mt-1.5">
                  <CustomSelect
                    value={form.exam}
                    onChange={(exam) => setForm({ ...form, exam })}
                    placeholder="Select exam"
                    options={examOptions}
                  />
                </div>
              </label>
              {examIsPaid ? (
                <p className="text-sm text-muted sm:col-span-2">
                  This exam is sold as one purchase. Every PDF inside it unlocks together.
                </p>
              ) : (
              <label className="block text-sm">
                Access
                <div className="mt-1.5">
                  <CustomSelect
                    value={form.access}
                    onChange={(access) => setForm({ ...form, access })}
                    options={[
                      { value: "free", label: "Free" },
                      { value: "paid", label: "Paid" },
                    ]}
                  />
                </div>
              </label>
              )}
              {!examIsPaid && form.access === "paid" && (
                <label className="block text-sm">
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    className={fieldClass}
                  />
                </label>
              )}
              <label className="block text-sm sm:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className={fieldClass}
                  rows={3}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                PDF {editingId ? "(leave empty to keep the current file)" : ""}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setForm({ ...form, file });
                    setFileLabel(file?.name || "");
                  }}
                  className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-elevated file:px-3 file:py-2 file:text-sm file:text-fg"
                />
                {fileLabel ? <span className="mt-1 block text-xs text-muted">{fileLabel}</span> : null}
              </label>
              <label className="block text-sm sm:col-span-2">
                Link to mock test
                <div className="mt-1.5">
                  <CustomSelect
                    value=""
                    onChange={(mockId) => {
                      if (mockId) toggleMock(mockId);
                    }}
                    placeholder="Select a mock test"
                    options={mocks
                      .filter((mock) => !form.mockTests.includes(mock._id))
                      .map((mock) => ({ value: mock._id, label: mock.seriesName }))}
                  />
                </div>
              </label>
            </div>
            {form.mockTests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.mockTests.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleMock(id)}
                    className="rounded-full bg-elevated px-3 py-1 text-xs text-fg"
                  >
                    {linkedName(id)} ×
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={closeMaterial} className="px-4 py-2 rounded-lg border border-line text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-solid text-solid-fg text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Add material"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirm && <ConfirmationModal modalData={confirm} />}
    </div>
  );
};

export default StudyPdfAdmin;
