import React from "react";
import { FieldError } from "react-hook-form";

interface Tag {
  id: number;
  name: string;
  category: string;
}

interface InputFormMultiSelectProps {
  label: string;
  error?: FieldError | { message?: string };
  tags: Tag[];
  selectedTags: number[];
  onChange: (selectedIds: number[]) => void;
}

const InputFormMultiSelect = ({
  label,
  error,
  tags,
  selectedTags,
  onChange,
}: InputFormMultiSelectProps) => {
  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  // Group tags by category
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <label>{label}</label>
      <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <div key={category} className="mb-4 last:mb-0">
            <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
};

export default InputFormMultiSelect;

