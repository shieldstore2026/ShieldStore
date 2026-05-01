import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm text-neutral-500 mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-neutral-600">›</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-accent transition-colors">{item.label}</Link>
          ) : (
            <span className="text-neutral-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
