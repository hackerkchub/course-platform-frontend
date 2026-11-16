'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchInstructorMaterials,
  fetchInstructorCourses,
  createInstructorMaterial,
  deleteInstructorMaterial,
  type InstructorMaterialItem,
  type InstructorCourseItem,
} from '@/lib/api/instructor-portal';

export default function InstructorMaterialsPage() {
  const [materials, setMaterials] = useState<InstructorMaterialItem[]>([]);
  const [courses, setCourses] = useState<InstructorCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState('notes');
  const [filePath, setFilePath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [mats, crs] = await Promise.all([
        fetchInstructorMaterials(),
        fetchInstructorCourses(),
      ]);
      setMaterials(mats);
      setCourses(crs);
      if (crs.length > 0 && !selectedCourseId) {
        setSelectedCourseId(crs[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !title.trim() || !filePath.trim()) return;
    try {
      setIsSubmitting(true);
      await createInstructorMaterial({
        course_id: Number(selectedCourseId),
        title: title.trim(),
        material_type: materialType,
        file_path: filePath.trim(),
      });
      setTitle('');
      setFilePath('');
      setIsAddOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to upload study material');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    try {
      await deleteInstructorMaterial(id);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete material');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Study Materials</h1>
          <p className="text-sm text-muted-foreground">
            Upload lecture notes, assignment worksheets, and reference guides for students.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Materials Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No Materials Uploaded</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Provide slides, PDFs, or code samples for students by adding a material.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Material</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Added Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{mat.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{mat.file_path}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{mat.course_name}</div>
                      <div className="text-xs text-muted-foreground">{mat.course_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                        {mat.material_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(mat.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={mat.file_url || mat.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="View / Download"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(mat.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                          title="Delete Material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Material */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Upload Study Material</h3>
            <form onSubmit={handleAddMaterial} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Target Course</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_name} ({c.course_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1 Lecture Slides"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="notes">Lecture Notes</option>
                  <option value="worksheet">Worksheet / Practice</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="project">Project File</option>
                  <option value="brochure">Brochure</option>
                  <option value="other">Other Reference</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">File Path / Resource URL</label>
                <input
                  type="text"
                  required
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="/files/materials/lecture1.pdf or https://..."
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
