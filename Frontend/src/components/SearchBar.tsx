import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { ShineBorder } from "./ui/shine-border";

const SAMPLE_ITEMS = [
  "React Framework",
  "TypeScript Language",
  "Tailwind CSS",
  "JavaScript Basics",
  "Node.js Runtime",
  "GraphQL API",
  "PostgreSQL Database",
  "Docker Containers",
  "Kubernetes Orchestration",
  "Redis Caching",
  "Python Programming",
  "Machine Learning",
  "Web Development",
  "Mobile Applications",
  "Cloud Computing",
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

const SearchBar = ({ value, onChange, onSubmit }:SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.length > 0
    ? SAMPLE_ITEMS.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  const showDropdown = isFocused && filtered.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-175 mx-auto">
      <div className="relative">
          <ShineBorder/>
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
          size={20}
          style={{ color: isFocused ? "#FF00FF" : "#FF00FF" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit(value);
              setIsFocused(false);
            }
          }}
          placeholder="Search..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border bg-background text-base outline-none transition-all duration-200 shadow-sm"
          style={{
            color: "#FFFFFF",
            borderColor:"#FF00FF",
            boxShadow: isFocused
              ? "0 0 0 3px rgba(255, 0, 255, 0.15), 0 4px 12px rgba(0,0,0,0.05)"
              : "0 1px 4px rgba(0,0,0,0.04)",
          }}
        />
      </div>

      {showDropdown && (
        <ul
          className="absolute z-50 mt-2 w-full rounded-xl border bg-black shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {filtered.map((item) => (
            <li
              key={item}
              onClick={() => {
                onChange(item);
                onSubmit(item);
                setIsFocused(false);
              }}
              className="px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
              style={{ color: "#FFFFFF" }}
              onMouseEnter={(e) => {
                (e.target as HTMLLIElement).style.backgroundColor = "rgba(255, 0, 255, 0.08)";
                (e.target as HTMLLIElement).style.color = "#FF00FF";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLLIElement).style.backgroundColor = "transparent";
                (e.target as HTMLLIElement).style.color = "#FFFFFF";
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
