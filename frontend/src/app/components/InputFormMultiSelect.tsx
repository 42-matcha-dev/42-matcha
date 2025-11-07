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
  const MAX_TAGS = 5;
  const isAtLimit = selectedTags.length >= MAX_TAGS;

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      // Prevent selecting more than MAX_TAGS
      if (selectedTags.length < MAX_TAGS) {
        onChange([...selectedTags, tagId]);
      }
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
      <div className="flex justify-between items-center">
        <label>{label}</label>
        <span className="text-sm text-gray-500">
          {selectedTags.length}/{MAX_TAGS}
        </span>
      </div>
      <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <div key={category} className="mb-4 last:mb-0">
            <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && isAtLimit;

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={isDisabled}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white border-blue-500"
                        : isDisabled
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {isAtLimit && !error && (
        <div className="text-sm text-gray-600">
          Maximum de {MAX_TAGS} tags sélectionnés. Désélectionnez un tag pour en choisir un autre.
        </div>
      )}
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
};

export default InputFormMultiSelect;

