import { CONTENT_SCHEMA } from '@/lib/contentSchema';

const SURFACES = [
  { key: 'form',   label: 'Add Form' },
  { key: 'edit',   label: 'Edit Form' },
  { key: 'tile',   label: 'Dashboard Tile' },
  { key: 'social', label: 'Social Graphic' },
];

export default function SchemaRegistryTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Content Type</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Field</th>
            {SURFACES.map(s => (
              <th key={s.key} className="text-center py-3 px-3 font-semibold text-foreground">{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(CONTENT_SCHEMA).map((schema, schemaIdx) => {
            const fieldEntries = Object.entries(schema.fields);
            return fieldEntries.map(([fieldKey, fieldDef], fieldIdx) => (
              <tr
                key={`${schema.slug}-${fieldKey}`}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {fieldIdx === 0 && (
                  <td
                    rowSpan={fieldEntries.length}
                    className="py-3 px-4 align-top font-medium text-foreground"
                    style={{ borderRight: '1px solid hsl(var(--border))' }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{schema.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{schema.slug}</span>
                    </div>
                  </td>
                )}
                <td className="py-2 px-4 text-muted-foreground font-mono text-xs">{fieldKey}</td>
                {SURFACES.map(s => {
                  const visible = fieldDef.show?.[s.key];
                  const optional = fieldDef.optional;
                  return (
                    <td key={s.key} className="py-2 px-3 text-center">
                      {visible ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                          style={{ background: optional ? 'rgba(212,131,10,0.12)' : 'rgba(74,124,89,0.15)', color: optional ? '#d4830a' : '#4a7c59' }}
                          title={optional ? 'optional' : 'required'}
                        >
                          {optional ? '○' : '●'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ));
          })}
        </tbody>
      </table>
      <div className="flex items-center gap-4 mt-4 px-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold" style={{ background: 'rgba(74,124,89,0.15)', color: '#4a7c59' }}>●</span>
          Required / always shown
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold" style={{ background: 'rgba(212,131,10,0.12)', color: '#d4830a' }}>○</span>
          Optional (shown if present)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground/40">—</span>
          Hidden
        </span>
      </div>
    </div>
  );
}