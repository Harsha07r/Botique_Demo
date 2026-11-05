import { PortableText, type PortableTextBlock } from "@portabletext/react";
import type { RichBlock } from "@/lib/types";

export function PageBody({ body }: { body: string[] | RichBlock[] }) {
  if (!body.length) return null;
  const prose = "grid gap-4 text-[1.05rem] leading-relaxed";
  if (typeof body[0] === "string") {
    return (
      <div className={prose}>
        {(body as string[]).map((t) => <p key={t}>{t}</p>)}
      </div>
    );
  }
  return (
    <div className={prose}>
      <PortableText
        value={body as unknown as PortableTextBlock[]}
        components={{
          block: { h2: ({ children }) => <h2 className="mt-4 text-2xl font-semibold">{children}</h2> },
          list: { bullet: ({ children }) => <ul className="ml-5 list-disc grid gap-1">{children}</ul> },
        }}
      />
    </div>
  );
}
