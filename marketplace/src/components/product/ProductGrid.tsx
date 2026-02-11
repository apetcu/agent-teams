interface ProductGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ children, columns = 4 }: ProductGridProps) {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-6`}>
      {children}
    </div>
  );
}
