"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import BackButton from "./back-button";
import Social from "./social";

interface CardWrapperProps {
  children: React.ReactNode;
  headerlabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export default function CardWrapper({
  children,
  backButtonHref,
  backButtonLabel,
  headerlabel,
  showSocial,
}: CardWrapperProps) {
  return (
    <div className="relative p-4 md:p-8">
      {/* Main Card Content */}
      <div className="relative z-10 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-black border-4 border-black p-4 mb-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
              {headerlabel}
            </h1>
          </div>
        </div>

        <div className="bg-white border-8 border-black p-6 md:p-8 transform hover:translate-x-2 hover:translate-y-2 transition-transform duration-200 shadow-[8px_8px_0px_0px_#000000]">
          <div className="mb-6 space-y-4">{children}</div>

          {showSocial && (
            <div className="mt-6">
              {/* <div className="bg-blue-500 border-4 border-black p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300"> */}
              <Social />
              {/* </div> */}
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="bg-white border-4 border-black p-3 inline-block transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <BackButton
                label={backButtonLabel}
                href={backButtonHref}
                className="text-white font-bold uppercase underline decoration-yellow-400 cursor-pointer hover:text-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
