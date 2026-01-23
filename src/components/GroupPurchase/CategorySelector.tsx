import styled from "styled-components";
import { POST_CATEGORIES } from "@/constants/groupPurchase";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <CategoryRow>
      {POST_CATEGORIES.map((item) => (
        <CategoryButton
          key={item}
          selected={selectedCategory === item}
          onClick={() => onSelectCategory(item)}
        >
          {item}
        </CategoryButton>
      ))}
    </CategoryRow>
  );
}

const CategoryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  flex-wrap: wrap;
`;

const CategoryButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  background-color: ${(props) => (props.selected ? "#007bff" : "#fff")};
  color: ${(props) => (props.selected ? "#fff" : "#000")};
  cursor: pointer;

  min-width: fit-content;
`;
