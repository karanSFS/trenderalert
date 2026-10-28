"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface SearchInputProps {
  /** Committed search value, usually from the list query in Redux. */
  value: string;
  onSearch: (value: string) => void;
  /** Required: the input has no visible label. */
  ariaLabel: string;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/** Search box that commits after the user pauses typing, on Enter, or on clear. */
export function SearchInput({
  value,
  onSearch,
  ariaLabel,
  placeholder = "Search",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (value !== committed) {
    setCommitted(value);
    setText(value);
  }

  // A new committed value (including an external reset) cancels any pending debounce.
  useEffect(() => () => clearTimeout(timer.current), [value]);

  const commit = (next: string) => {
    clearTimeout(timer.current);
    const trimmed = next.trim();
    if (trimmed !== value) onSearch(trimmed);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setText(next);
    clearTimeout(timer.current);
    if (next === "") {
      commit("");
      return;
    }
    timer.current = setTimeout(() => commit(next), debounceMs);
  };

  return (
    <Input
      className={className}
      allowClear
      prefix={<SearchOutlined aria-hidden="true" />}
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={text}
      onChange={handleChange}
      onPressEnter={() => commit(text)}
    />
  );
}
