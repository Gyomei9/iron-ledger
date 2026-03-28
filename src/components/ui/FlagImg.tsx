"use client";
import { getCountryCode } from "@/lib/utils";

interface Props {
  country: string | null;
  size?: number;
}

export default function FlagImg({ country, size = 16 }: Props) {
  const code = getCountryCode(country);
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={country || ""}
      width={size}
      height={Math.round(size * 0.75)}
      style={{ display: "inline-block", verticalAlign: "middle", borderRadius: 2 }}
    />
  );
}
