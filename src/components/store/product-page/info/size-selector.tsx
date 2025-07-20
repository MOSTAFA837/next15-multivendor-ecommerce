import { Size } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

interface Props {
  sizes: Size[];
  sizeId: string | undefined;
  setSizeId: Dispatch<SetStateAction<string>>;
}

export default function SizeSelector({ sizeId, setSizeId, sizes }: Props) {
  const handleSelectSize = (size: Size) => {
    setSizeId(size.id);
  };

  console.log("sizes", sizes);

  return (
    <div className="flex flex-wrap gap-4">
      {sizes.map((size) => (
        <span
          key={size.size}
          className={`border rounded-full px-5 py-1 cursor-pointer transition-all hover:bg-blue-500 hover:text-white ${
            size.id === sizeId ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => handleSelectSize(size)}
        >
          {size.size}
        </span>
      ))}
    </div>
  );
}
