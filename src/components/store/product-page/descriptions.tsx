"use client";

import DOMPurify from "dompurify";

export default function Descriptions({ text }: { text: [string, string] }) {
  const sanitizedProductDesc = DOMPurify.sanitize(text[0]);
  const sanitizedVariantDesc = DOMPurify.sanitize(text[0]);

  return (
    <div className="">
      <div dangerouslySetInnerHTML={{ __html: sanitizedProductDesc }} />
      <div dangerouslySetInnerHTML={{ __html: sanitizedVariantDesc }} />
    </div>
  );
}
