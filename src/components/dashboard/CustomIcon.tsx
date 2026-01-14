"use client";

import * as Lucide from "lucide-react";
import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

type Props = {
  spec?: string | null; // admin-provided text or raw SVG
  className?: string;
  size?: number; // default to 20
};
const iconType = {
  SVG: "svg",
  LUCIDE: "lucide",
  BULLET: " bullet",
};
// normalize admin-provided names to Lucide keys
const normalizeLucideKey = (s: string) => {
  const raw = s?.trim()?.replace(/^lucide[:\-]/i, "");

  // exact match
  if (Lucide[raw as keyof typeof Lucide]) return raw as keyof typeof Lucide;

  // kebab-case or snake_case to PascalCase
  const pascal = raw
    .split(/[-_\s]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  if (Lucide[pascal as keyof typeof Lucide])
    return pascal as keyof typeof Lucide;

  // common Icon suffix
  if (Lucide[`${pascal}Icon` as keyof typeof Lucide])
    return `${pascal}Icon` as keyof typeof Lucide;

  // lowercase direct hit
  if (Lucide[raw.toLowerCase() as keyof typeof Lucide])
    return raw.toLowerCase() as keyof typeof Lucide;

  return null;
};

const isSvg = (s?: string | null) => !!s && s?.trim()?.startsWith("<svg");

const CustomIcon = memo(function CustomIcon({
  spec,
  className,
  size = 20,
}: Props) {
  const render = useMemo(() => {
    if (!spec) return { kind: iconType.BULLET } as const;

    // 1) raw SVG string
    if (isSvg(spec)) {
      return { kind: iconType.SVG, svg: spec };
    }

    // 2) Lucide icon
    const key = normalizeLucideKey(spec);
    if (key) {
      return {
        kind: iconType.LUCIDE,
        comp: Lucide[key as keyof typeof Lucide] as React.ComponentType<{
          className?: string;
          size?: number;
        }>,
      };
    }

    // 3) fallback bullet
    return { kind: iconType.BULLET } as const;
  }, [spec]);

  // 1) Lucide
  if (render.kind === iconType.LUCIDE) {
    const Cmp = render.comp!;
    return <Cmp className={className} size={size} />;
  }

  // 2) SVG
  if (render.kind === iconType.SVG) {
    return (
      <span
        className={cn(className, "inline-flex items-center justify-center")}
        style={{
          width: size,
          height: size,
        }}
        dangerouslySetInnerHTML={{ __html: render.svg! }}
      />
    );
  }

  // 3) Bullet fallback
  if (render.kind === iconType.BULLET) {
    const bulletSize = Math.min(8, size * 0.4); // keeps bullet proportional
    return (
      <span
        className={cn(className, "inline-flex items-center justify-center")}
        style={{
          width: size,
          height: size,
        }}
      >
        <span
          className="bg-current block"
          style={{
            width: bulletSize,
            height: bulletSize,
            borderRadius: "50%",
          }}
        />
      </span>
    );
  }

  return null;
});

export default CustomIcon;
