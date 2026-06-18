import Link from "next/link";
import ImportForm from "@/components/admin/ImportForm";

export default function ImportPage() {
  return (
    <div className="admin-edit">
      <Link href="/admin/games" className="admin-back">
        ← Back to games
      </Link>
      <h2 className="admin-section-title">Import games from CSV</h2>
      <p className="admin-field__hint admin-import__intro">
        Upload or paste a CSV to add or update games in bulk. Existing games are
        matched on their slug and updated in place — nothing is duplicated.
      </p>

      <ImportForm />
    </div>
  );
}
