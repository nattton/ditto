import { useStore } from "../store";

const PALETTE = [
  { name: "Violet", value: "#a78bfa" },
  { name: "Cyan", value: "#22d3ee" },
  { name: "Emerald", value: "#34d399" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Rose", value: "#fb7185" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Orange", value: "#fb923c" },
  { name: "Pink", value: "#f472b6" },
  { name: "Teal", value: "#2dd4bf" },
  { name: "Lime", value: "#a3e635" },
  { name: "Indigo", value: "#818cf8" },
  { name: "Red", value: "#f87171" },
];

const DEFAULT_COLOR = "#a78bfa";

interface Props {
  onClose: () => void;
}

export default function TagColorModal({ onClose }: Props) {
  const { routes, tagColors, setTagColor } = useStore();

  const allTags = Array.from(new Set(routes.flatMap((r) => r.tags ?? []))).sort(
    (a, b) => a.localeCompare(b),
  );

  const getColor = (tag: string) => tagColors[tag] ?? DEFAULT_COLOR;

  const handleReset = (tag: string) => {
    setTagColor(tag, DEFAULT_COLOR);
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-zinc-800'>
          <h2 className='text-base font-semibold text-zinc-100'>
            Customize Tag Colors
          </h2>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {allTags.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-14 text-zinc-600'>
              <div className='text-4xl mb-3'>🏷️</div>
              <p className='text-sm font-medium'>No tags yet</p>
              <p className='text-xs mt-1 text-zinc-700'>
                Add tags to routes to customize their colors here.
              </p>
            </div>
          ) : (
            <div className='space-y-5'>
              {allTags.map((tag) => {
                const color = getColor(tag);
                const isDefault = color === DEFAULT_COLOR;
                return (
                  <div key={tag} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      {/* Tag preview pill */}
                      <span
                        className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border'
                        style={{
                          backgroundColor: `${color}26`,
                          borderColor: `${color}55`,
                          color: color,
                        }}
                      >
                        {tag}
                      </span>

                      {/* Reset link */}
                      {!isDefault && (
                        <button
                          onClick={() => handleReset(tag)}
                          className='text-xs text-zinc-600 hover:text-zinc-400 transition-colors'
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Color palette */}
                    <div className='flex flex-wrap gap-2'>
                      {PALETTE.map((swatch) => {
                        const active = color === swatch.value;
                        return (
                          <button
                            key={swatch.value}
                            title={swatch.name}
                            onClick={() => setTagColor(tag, swatch.value)}
                            className='relative w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none'
                            style={{ backgroundColor: swatch.value }}
                          >
                            {active && (
                              <span className='absolute inset-0 flex items-center justify-center'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='w-3 h-3'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='rgba(0,0,0,0.7)'
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M5 13l4 4L19 7'
                                  />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-zinc-800'>
          <button
            onClick={onClose}
            className='w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-colors'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
