export default function SourceToggle({ value, onChange }) {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'mine', label: 'Mine' },
    { value: 'library', label: 'Library' },
  ];

  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 text-xs font-medium transition-colors"
          style={value === opt.value ? {
            background: '#E8A838',
            color: '#2c1e0f',
          } : {
            background: 'transparent',
            color: '#7a5c3a',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}