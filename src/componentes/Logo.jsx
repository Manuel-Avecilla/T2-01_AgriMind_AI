export function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M27.5 4.5c-8.7 0-15.8 7-15.8 15.6 0 3.4 1.1 6.6 3 9.2v6.2c0 1.9 1.5 3.4 3.4 3.4h12.4V4.5h-.8Z" fill="#0f2a47"/>
      <circle cx="23.5" cy="17.5" r="4.2" fill="#f08a24"/>
      <g stroke="#f08a24" strokeWidth="1.4" strokeLinecap="round">
        <path d="M23.5 9.5v2.2M16 17.5h2.2M28.8 17.5h2.2M18.2 12.2l1.6 1.6M28.8 12.2l-1.6 1.6"/>
      </g>
      <path d="M13 27.5h17v3H13z" fill="#2fbf86"/>
      <path d="M14.5 31.5h15.5v3H14.5z" fill="#1f9d63"/>
      <path d="M16 35.5h14v3H16z" fill="#16794d"/>
      <path d="M28 38.5c3.6-.6 6.2-2.7 7-6.2-3.7.3-6.4 2.4-7 6.2Z" fill="#2fbf86"/>
    </svg>
  );
}
