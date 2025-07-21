"use client";

import { X } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useRef } from "react";
import useOnClickOutside from "use-onclickoutside";

interface Props {
  title?: string;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}

export default function Modal({ children, setShow, show, title }: Props) {
  const ref = useRef(null);
  const close = () => setShow(false);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  useOnClickOutside(ref, close);

  if (show) {
    return (
      <div className="w-full h-full fixed top-0 left-0 right-0 bottom-0 bg-gray-50/65 z-50">
        <div
          ref={ref}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 md:px-10 w-[calc(100%-1rem)] max-w-[900px] py-5 shadow-md rounded-lg"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h1 className="text-xl font-bold">{title}</h1>
            <X
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShow(false)}
            />
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    );
  } else return null;
}
